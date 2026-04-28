package com.aimestart.rpggameback;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.Table;

import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "game_save")
public class GameSave {

    @Id
    private Long id;

    @Column(name = "current_day")
    private int day;
    private int battleCount;
    private int playerHp;
    @Column(name = "max_hp")
    private Integer maxHp;
    private int level;
    private String weapon;
    private String gameMode;
    private int gold;
    private int xp;
    private int xpNeeded;
    private String currentEnemyName;
    private int currentEnemyHp;
    private int currentEnemyDef;
    private int currentEnemyGold;
    private int currentEnemyXp;

    @Column(length = 1000)
    private String currentEnemyDescription;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "game_save_backpack", joinColumns = @JoinColumn(name = "game_save_id"))
    @MapKeyColumn(name = "item_name")
    @Column(name = "item_count")
    private Map<String, Integer> backpack = new HashMap<>();

    public static GameSave newGame() {
        GameSave save = new GameSave();
        save.resetProgress();
        return save;
    }

    public void resetProgress() {
        id = 1L;
        day = 1;
        battleCount = 0;
        playerHp = 100;
        maxHp = 100;
        level = 1;
        weapon = null;
        gameMode = "CLASSIC";
        gold = 20;
        xp = 0;
        xpNeeded = 100;
        currentEnemyName = null;
        currentEnemyHp = 0;
        currentEnemyDef = 0;
        currentEnemyGold = 0;
        currentEnemyXp = 0;
        currentEnemyDescription = null;
        backpack = new HashMap<>(Map.of("Health Potion", 2));
    }

    public void ensureDefaults() {
        if (id == null) {
            id = 1L;
        }
        if (backpack == null) {
            backpack = new HashMap<>();
        }
        backpack.putIfAbsent("Health Potion", 0);
        if (xpNeeded <= 0) {
            xpNeeded = 100;
        }
        if (level <= 0) {
            level = 1;
        }
        if (maxHp <= 0) {
            maxHp = 100;
        }
        if (gameMode == null || gameMode.isBlank()) {
            gameMode = "CLASSIC";
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getDay() {
        return day;
    }

    public void setDay(int day) {
        this.day = day;
    }

    public int getPlayerHp() {
        return playerHp;
    }

    public void setPlayerHp(int playerHp) {
        this.playerHp = playerHp;
    }

    public int getMaxHp() {
        return maxHp == null || maxHp <= 0 ? 100 : maxHp;
    }

    public void setMaxHp(int maxHp) {
        this.maxHp = maxHp;
    }

    public int getBattleCount() {
        return battleCount;
    }

    public void setBattleCount(int battleCount) {
        this.battleCount = battleCount;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public String getWeapon() {
        return weapon;
    }

    public void setWeapon(String weapon) {
        this.weapon = weapon;
    }

    public String getGameMode() {
        return gameMode;
    }

    public void setGameMode(String gameMode) {
        this.gameMode = gameMode;
    }

    public int getGold() {
        return gold;
    }

    public void setGold(int gold) {
        this.gold = gold;
    }

    public int getXp() {
        return xp;
    }

    public void setXp(int xp) {
        this.xp = xp;
    }

    public int getXpNeeded() {
        return xpNeeded;
    }

    public void setXpNeeded(int xpNeeded) {
        this.xpNeeded = xpNeeded;
    }

    public String getCurrentEnemyName() {
        return currentEnemyName;
    }

    public void setCurrentEnemyName(String currentEnemyName) {
        this.currentEnemyName = currentEnemyName;
    }

    public int getCurrentEnemyHp() {
        return currentEnemyHp;
    }

    public void setCurrentEnemyHp(int currentEnemyHp) {
        this.currentEnemyHp = currentEnemyHp;
    }

    public int getCurrentEnemyDef() {
        return currentEnemyDef;
    }

    public void setCurrentEnemyDef(int currentEnemyDef) {
        this.currentEnemyDef = currentEnemyDef;
    }

    public int getCurrentEnemyGold() {
        return currentEnemyGold;
    }

    public void setCurrentEnemyGold(int currentEnemyGold) {
        this.currentEnemyGold = currentEnemyGold;
    }

    public int getCurrentEnemyXp() {
        return currentEnemyXp;
    }

    public void setCurrentEnemyXp(int currentEnemyXp) {
        this.currentEnemyXp = currentEnemyXp;
    }

    public String getCurrentEnemyDescription() {
        return currentEnemyDescription;
    }

    public void setCurrentEnemyDescription(String currentEnemyDescription) {
        this.currentEnemyDescription = currentEnemyDescription;
    }

    public Map<String, Integer> getBackpack() {
        return backpack;
    }

    public void setBackpack(Map<String, Integer> backpack) {
        this.backpack = backpack;
    }
}
