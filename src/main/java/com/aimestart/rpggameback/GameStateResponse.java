package com.aimestart.rpggameback;

import java.util.List;
import java.util.Map;

public class GameStateResponse {

    private int crit;
    private int atk;
    private int hp;
    private int maxHp;
    private int level;
    private int day;
    private int battleCount;
    private List<String> weaponOptions;
    private String weapon;
    private int gold;
    private int xp;
    private int xpNeeded;
    private Map<String, Integer> backpack;
    private boolean battleActive;
    private String enemyName;
    private int enemyHp;
    private String enemyDescription;
    private String gameMode;


    public GameStateResponse(int hp, int level, List<String> weaponOptions) {
        this.hp = hp;
        this.level = level;
        this.weaponOptions = weaponOptions;
    }


    public GameStateResponse(Player player) {
        this.crit = player.getCrit();
        this.atk = player.getAtk();
        this.hp = player.getHp();
        this.level = player.getLevel();
        this.weapon = player.getWeapon();
        this.gold = player.getGold();
        this.xp = player.getXpbar();
        this.xpNeeded = player.getEndbar();
        this.backpack = player.getBackpack();
    }




    public GameStateResponse() {}


    public int getHp() {
        return hp;
    }

    public void setHp(int hp) {
        this.hp = hp;
    }

    public int getMaxHp() {
        return maxHp;
    }

    public void setMaxHp(int maxHp) {
        this.maxHp = maxHp;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public List<String> getWeaponOptions() {
        return weaponOptions;
    }

    public void setWeaponOptions(List<String> weaponOptions) {
        this.weaponOptions = weaponOptions;
    }

    public String getWeapon() {
        return weapon;
    }

    public void setWeapon(String weapon) {
        this.weapon = weapon;
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

    public Map<String, Integer> getBackpack() {
        return backpack;
    }

    public void setBackpack(Map<String, Integer> backpack) {
        this.backpack = backpack;
    }
    public int getAtk() {
        return atk;
    }

    public void setAtk(int atk) {
        this.atk = atk;
    }

    public int getCrit() {
        return crit;
    }

    public void setCrit(int crit) {
        this.crit = crit;
    }

    public int getDay() {
        return day;
    }

    public void setDay(int day) {
        this.day = day;
    }

    public int getBattleCount() {
        return battleCount;
    }

    public void setBattleCount(int battleCount) {
        this.battleCount = battleCount;
    }

    public boolean isBattleActive() {
        return battleActive;
    }

    public void setBattleActive(boolean battleActive) {
        this.battleActive = battleActive;
    }

    public String getEnemyName() {
        return enemyName;
    }

    public void setEnemyName(String enemyName) {
        this.enemyName = enemyName;
    }

    public int getEnemyHp() {
        return enemyHp;
    }

    public void setEnemyHp(int enemyHp) {
        this.enemyHp = enemyHp;
    }

    public String getEnemyDescription() {
        return enemyDescription;
    }

    public void setEnemyDescription(String enemyDescription) {
        this.enemyDescription = enemyDescription;
    }

    public String getGameMode() {
        return gameMode;
    }

    public void setGameMode(String gameMode) {
        this.gameMode = gameMode;
    }

}
