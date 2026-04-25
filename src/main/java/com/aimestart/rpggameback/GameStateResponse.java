package com.aimestart.rpggameback;

import java.util.List;
import java.util.Map;

public class GameStateResponse {

    private int crit;
    private int atk;
    private int hp;
    private int level;
    private List<String> weaponOptions;
    private String weapon;
    private int gold;
    private int xp;
    private int xpNeeded;
    private Map<String, Integer> backpack;


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

}