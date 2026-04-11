
package com.aimestart.rpggameback;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Random;

public class Enemy {
    private String name;
    private int hp;
    private int atk;
    private int def;
    private int xp;
    private String description;


    private int gold;

    ArrayList<String> Monsters = new ArrayList<>();
    Random rand = new Random();

    public int atkrange(int min, int max){
        return rand.nextInt(max - min + 1) + min;
    }

    public Enemy(){
        Monsters.addAll(Arrays.asList("Wolf", "Golem", "Slime"));
        int randomness = rand.nextInt(Monsters.size());
        switch(Monsters.get(randomness)){
            case "Wolf":
                this.name = "Wolf";
                this.hp = 20;
                this.atk = atkrange(3,5);
                this.xp = 19;
                this.gold = 16;
                this.description = "A rabid animal who has lost all sense of meaning";
                break;
            case "Slime":
                this.name = "Slime";
                this.hp = 14;
                this.atk = atkrange(2,4);
                this.xp = 22;
                this.gold = 12;
                this.description = "A monster you've only read about in stories. It seems weak to elemental attacks";
                break;
            case "Golem":
                this.name = "Golem";
                this.hp = 50;
                this.atk = atkrange(7,15);
                this.def = 20;
                this.xp = 50;
                this.gold = 25;
                this.description = "A shadow looms over you as you stare up at the rock monster. You sense bladed weapons won't be efficient";
                break;
            case "Zombie":
                this.name = "Zombie";
                this.hp = 10;
                this.atk = atkrange(1,2);
                this.xp = 10;
                this.gold = 4;
                this.description = "A zombie that has been left to rot in the shadows";
                break;
            case "Skeleton":
                this.name = "Skeleton";
                this.hp = 15;
                this.atk = atkrange(1,4);
                this.xp = 14;
                this.gold = 7;
                this.description = "A skeleton warrior who has forgotten both their name and goal";
                break;
        }
    }
    public void checkEnemy(){
        switch(this.getName()){
            case "Slime":
                this.atk = atkrange(2,4);
                break;
            case "Wolf":
                this.atk = atkrange(3,5);
                break;
            case "Golem":
                this.atk = atkrange(7,15);
                break;
            case "Zombie":
                this.atk = atkrange(1,2);
                break;
            case "Skeleton":
                this.atk = atkrange(1,4);
                break;
        }
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }



    public int getGold() {
        return gold;
    }

    public void setGold(int gold) {
        this.gold = gold;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getXp() {
        return xp;
    }

    public void setXp(int xp) {
        this.xp = xp;
    }

    public int getHp() {
        return hp;
    }

    public void setHp(int hp) {
        this.hp = hp;
    }

    public int getAtk() {
        return atk;
    }

    public void setAtk(int atk) {
        this.atk = atk;
    }

    public int getDef() {
        return def;
    }

    public void setDef(int def) {
        this.def = def;
    }

    public void death(Player player){
        int initial = player.getXpbar();
        initial += this.xp;
        player.setXpbar(initial);
    }
}
