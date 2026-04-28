package com.aimestart.rpggameback;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Random;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@Transactional
public class GameStateService {

    private static final long SAVE_ID = 1L;
    private static final String CLASSIC_MODE = "CLASSIC";
    private static final String ENDLESS_MODE = "ENDLESS";
    private static final List<String> STARTING_WEAPONS = List.of("Wooden Sword", "Rusted Dagger", "Old Scythe");
    private static final String HEALTH_POTION = "Health Potion";
    private static final int HEALTH_POTION_COST = 10;
    private static final double SILVER_WEAPON_MULTIPLIER = 1.25;
    private static final double GOLD_WEAPON_MULTIPLIER = 1.5;
    private static final double ENDLESS_ENEMY_SCALING = 1.15;

    private final GameSaveRepository repository;
    private final Random random = new Random();

    public GameStateService(GameSaveRepository repository) {
        this.repository = repository;
    }

    public GameStateResponse startGame() {
        GameSave save = repository.findById(SAVE_ID).orElseGet(GameSave::newGame);
        save.resetProgress();
        repository.saveAndFlush(save);
        return toGameStateResponse(save);
    }

    public GameStateResponse getCurrentState() {
        return toGameStateResponse(loadGame());
    }

    public GameStateResponse selectMode(String mode) {
        GameSave save = loadGame();
        String normalizedMode = mode == null ? "" : mode.trim().toUpperCase();
        if (!CLASSIC_MODE.equals(normalizedMode) && !ENDLESS_MODE.equals(normalizedMode)) {
            throw new ResponseStatusException(BAD_REQUEST, "Unknown game mode.");
        }
        save.setGameMode(normalizedMode);
        repository.save(save);
        return toGameStateResponse(save);
    }

    public GameStateResponse selectWeapon(String weaponName) {
        GameSave save = loadGame();
        save.setWeapon(weaponName);
        repository.save(save);
        return toGameStateResponse(save);
    }

    public GameStateResponse selectItem(String item) {
        GameSave save = loadGame();
        ensureShopAvailable(save);

        if (!HEALTH_POTION.equals(item)) {
            throw new ResponseStatusException(BAD_REQUEST, "That item is not sold here.");
        }

        if (save.getGold() < HEALTH_POTION_COST) {
            throw new ResponseStatusException(BAD_REQUEST, "You do not have enough gold.");
        }

        save.setGold(save.getGold() - HEALTH_POTION_COST);
        save.getBackpack().put(item, save.getBackpack().getOrDefault(item, 0) + 1);
        repository.save(save);
        return toGameStateResponse(save);
    }

    public BattleResponse useItem(String item) {
        GameSave save = loadGame();
        ensureBattleStarted(save);

        int currentCount = save.getBackpack().getOrDefault(item, 0);
        if (currentCount <= 0) {
            return toBattleResponse(save, 0, 0, "You do not have any " + item + ".", "");
        }

        save.getBackpack().put(item, currentCount - 1);

        String useMessage;
        if ("Health Potion".equals(item)) {
            save.setPlayerHp(Math.min(save.getMaxHp(), save.getPlayerHp() + 20));
            useMessage = "You drink the potion. +20 HP!";
        } else {
            useMessage = "You used " + item + ".";
        }

        int enemyDamage = enemyAttack(save);
        save.setPlayerHp(save.getPlayerHp() - enemyDamage);
        repository.save(save);

        return toBattleResponse(
                save,
                0,
                enemyDamage,
                useMessage,
                "Enemy strikes back for " + enemyDamage + "!"
        );
    }

    public BattleResponse startBattle() {
        GameSave save = loadGame();
        rollEnemy(save);
        repository.save(save);
        return toBattleResponse(save, 0, 0, "Enemy Created", "");
    }

    public BattleResponse attack() {
        GameSave save = loadGame();
        ensureBattleStarted(save);

        int damage = playerAttack(save);
        int reduction = save.getCurrentEnemyDef() == 0 ? 0 : (save.getCurrentEnemyDef() * damage) / 100;
        boolean crit = random.nextInt(100) + 1 <= playerCrit(save);
        String weaponLabel = displayWeaponName(save);

        if (crit) {
            damage *= 2;
        }

        int appliedDamage = Math.max(damage - reduction, 0);
        save.setCurrentEnemyHp(save.getCurrentEnemyHp() - appliedDamage);

        String hitMessage;
        if (crit) {
            hitMessage = "Your " + weaponLabel + " feels light - CRITICAL HIT for " + damage + " damage!";
        } else {
            hitMessage = "You strike with your " + weaponLabel + " for " + damage + " damage.";
        }

        String finalMessage;
        String counterMessage;
        int enemyDamage = 0;
        BattleResponse response;

        if (save.getCurrentEnemyHp() <= 0) {
            save.setCurrentEnemyHp(0);
            finalMessage = "Victory! " + save.getCurrentEnemyName() + " has fallen.";
            counterMessage = "";
            response = toBattleResponse(save, damage, 0, finalMessage, counterMessage);
            rewardVictory(save);
            clearEnemy(save);
        } else {
            enemyDamage = enemyAttack(save);
            save.setPlayerHp(save.getPlayerHp() - enemyDamage);
            finalMessage = hitMessage;

            if (save.getPlayerHp() <= 0) {
                counterMessage = "Darkness consumes you...";
            } else if (save.getPlayerHp() <= 15) {
                counterMessage = save.getCurrentEnemyName() + " retaliates for " + enemyDamage + ". You are barely standing!";
            } else {
                counterMessage = save.getCurrentEnemyName() + " strikes back for " + enemyDamage + " damage.";
            }

            response = toBattleResponse(save, damage, enemyDamage, finalMessage, counterMessage);
        }

        repository.save(save);
        return response;
    }

    public int nextDay() {
        GameSave save = loadGame();
        save.setDay(save.getDay() + 1);
        save.setBattleCount(save.getBattleCount() + 1);
        repository.save(save);
        return save.getDay();
    }

    private GameSave loadGame() {
        GameSave save = repository.findById(SAVE_ID).orElseGet(GameSave::newGame);
        save.ensureDefaults();
        return save;
    }

    private void ensureBattleStarted(GameSave save) {
        if (save.getCurrentEnemyName() == null || save.getCurrentEnemyName().isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "No active battle. Start a battle first.");
        }
    }

    private void ensureShopAvailable(GameSave save) {
        if (save.getBattleCount() < 5) {
            throw new ResponseStatusException(BAD_REQUEST, "The shop is not available yet.");
        }
        if (save.getCurrentEnemyName() != null && !save.getCurrentEnemyName().isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "You cannot shop during a battle.");
        }
    }

    private void rewardVictory(GameSave save) {
        save.setGold(save.getGold() + save.getCurrentEnemyGold());
        save.setXp(save.getXp() + save.getCurrentEnemyXp());
        while (save.getXp() >= save.getXpNeeded()) {
            save.setXp(save.getXp() - save.getXpNeeded());
            save.setLevel(save.getLevel() + 1);
            int upgradedMaxHp = Math.max((int) Math.ceil(save.getMaxHp() * 1.2), save.getMaxHp() + 1);
            save.setMaxHp(upgradedMaxHp);
            int healAmount = (int) Math.ceil(upgradedMaxHp * 0.4);
            save.setPlayerHp(Math.min(upgradedMaxHp, save.getPlayerHp() + healAmount));
            save.setXpNeeded(save.getXpNeeded() * 3);
        }
    }

    private void clearEnemy(GameSave save) {
        save.setCurrentEnemyName(null);
        save.setCurrentEnemyHp(0);
        save.setCurrentEnemyDef(0);
        save.setCurrentEnemyGold(0);
        save.setCurrentEnemyXp(0);
        save.setCurrentEnemyDescription(null);
    }

    private void rollEnemy(GameSave save) {
        int roll = random.nextInt(5);
        switch (roll) {
            case 0 -> {
                save.setCurrentEnemyName("Wolf");
                save.setCurrentEnemyHp(scaleEnemyStat(save, 20));
                save.setCurrentEnemyDef(scaleEnemyStat(save, 0));
                save.setCurrentEnemyGold(16);
                save.setCurrentEnemyXp(19);
                save.setCurrentEnemyDescription("A rabid animal who has lost all sense of meaning");
            }
            case 1 -> {
                save.setCurrentEnemyName("Golem");
                save.setCurrentEnemyHp(scaleEnemyStat(save, 50));
                save.setCurrentEnemyDef(scaleEnemyStat(save, 10));
                save.setCurrentEnemyGold(25);
                save.setCurrentEnemyXp(50);
                save.setCurrentEnemyDescription("A shadow looms over you as you stare up at the rock monster. You sense bladed weapons won't be efficient");
            }
            case 2 -> {
                save.setCurrentEnemyName("Slime");
                save.setCurrentEnemyHp(scaleEnemyStat(save, 14));
                save.setCurrentEnemyDef(scaleEnemyStat(save, 0));
                save.setCurrentEnemyGold(12);
                save.setCurrentEnemyXp(22);
                save.setCurrentEnemyDescription("A monster you've only read about in stories. It seems weak to elemental attacks");
            }
            case 3 -> {
                save.setCurrentEnemyName("Zombie");
                save.setCurrentEnemyHp(scaleEnemyStat(save, 10));
                save.setCurrentEnemyDef(scaleEnemyStat(save, 0));
                save.setCurrentEnemyGold(4);
                save.setCurrentEnemyXp(10);
                save.setCurrentEnemyDescription("A zombie that has been left to rot in the shadows");
            }
            default -> {
                save.setCurrentEnemyName("Skeleton");
                save.setCurrentEnemyHp(scaleEnemyStat(save, 15));
                save.setCurrentEnemyDef(scaleEnemyStat(save, 0));
                save.setCurrentEnemyGold(7);
                save.setCurrentEnemyXp(14);
                save.setCurrentEnemyDescription("A skeleton warrior who has forgotten both their name and goal");
            }
        }
    }

    private int enemyAttack(GameSave save) {
        int baseDamage = switch (save.getCurrentEnemyName()) {
            case "Wolf" -> randomRange(3, 5);
            case "Golem" -> randomRange(7, 15);
            case "Slime" -> randomRange(2, 4);
            case "Zombie" -> randomRange(1, 2);
            case "Skeleton" -> randomRange(1, 4);
            default -> 0;
        };
        return scaleEnemyStat(save, baseDamage);
    }

    private int playerAttack(String weapon) {
        if (weapon == null || weapon.isBlank()) {
            return 0;
        }
        return switch (weapon) {
            case "Rusted Dagger" -> randomRange(2, 4);
            case "Wooden Sword" -> randomRange(5, 8);
            case "Old Scythe" -> randomRange(1, 4);
            default -> 1;
        };
    }

    private int playerCrit(String weapon) {
        if (weapon == null || weapon.isBlank()) {
            return 0;
        }
        return switch (weapon) {
            case "Rusted Dagger" -> 35;
            case "Wooden Sword" -> 10;
            case "Old Scythe" -> 60;
            default -> 0;
        };
    }

    private int playerAttack(GameSave save) {
        return scalePlayerDamage(playerAttack(save.getWeapon()), weaponMultiplier(save));
    }

    private int playerCrit(GameSave save) {
        return playerCrit(save.getWeapon());
    }

    private double weaponMultiplier(GameSave save) {
        if (!ENDLESS_MODE.equals(save.getGameMode())) {
            return 1;
        }
        if (save.getDay() >= 16) {
            return GOLD_WEAPON_MULTIPLIER;
        }
        if (save.getDay() >= 6) {
            return SILVER_WEAPON_MULTIPLIER;
        }
        return 1;
    }

    private String displayWeaponName(GameSave save) {
        if (save.getWeapon() == null || save.getWeapon().isBlank()) {
            return save.getWeapon();
        }
        double multiplier = weaponMultiplier(save);
        if (multiplier >= GOLD_WEAPON_MULTIPLIER) {
            return "Gold " + save.getWeapon();
        }
        if (multiplier >= SILVER_WEAPON_MULTIPLIER) {
            return "Silver " + save.getWeapon();
        }
        return save.getWeapon();
    }

    private int scalePlayerDamage(int baseDamage, double multiplier) {
        return Math.max((int) Math.round(baseDamage * multiplier), baseDamage > 0 ? 1 : 0);
    }

    private int scaleEnemyStat(GameSave save, int baseValue) {
        if (baseValue <= 0) {
            return 0;
        }
        return Math.max((int) Math.round(baseValue * endlessEnemyMultiplier(save)), 1);
    }

    private double endlessEnemyMultiplier(GameSave save) {
        if (!ENDLESS_MODE.equals(save.getGameMode())) {
            return 1;
        }
        int completedWaveSets = Math.max(save.getBattleCount(), 0) / 5;
        return Math.pow(ENDLESS_ENEMY_SCALING, completedWaveSets);
    }

    private int randomRange(int min, int max) {
        return random.nextInt(max - min + 1) + min;
    }

    private GameStateResponse toGameStateResponse(GameSave save) {
        GameStateResponse response = new GameStateResponse();
        response.setHp(save.getPlayerHp());
        response.setMaxHp(save.getMaxHp());
        response.setLevel(save.getLevel());
        response.setDay(save.getDay());
        response.setBattleCount(save.getBattleCount());
        response.setWeapon(displayWeaponName(save));
        response.setGold(save.getGold());
        response.setXp(save.getXp());
        response.setXpNeeded(save.getXpNeeded());
        response.setBackpack(save.getBackpack());
        response.setAtk(playerAttack(save));
        response.setCrit(playerCrit(save));
        response.setWeaponOptions(save.getWeapon() == null ? STARTING_WEAPONS : null);
        response.setBattleActive(save.getCurrentEnemyName() != null && !save.getCurrentEnemyName().isBlank());
        response.setEnemyName(save.getCurrentEnemyName());
        response.setEnemyHp(save.getCurrentEnemyHp());
        response.setEnemyDescription(save.getCurrentEnemyDescription());
        response.setGameMode(save.getGameMode());
        return response;
    }

    private BattleResponse toBattleResponse(GameSave save, int playerDamage, int enemyDamage, String message, String counterMessage) {
        return new BattleResponse(
                save.getCurrentEnemyHp(),
                playerDamage,
                enemyDamage,
                save.getCurrentEnemyDescription(),
                save.getPlayerHp(),
                save.getCurrentEnemyName(),
                message,
                counterMessage
        );
    }
}
