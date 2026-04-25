package com.aimestart.rpggameback;

import java.util.*;


public class Player {

    private int hp;
    private String Weapon;
    private int atk;
    private int crit = 0;
    private int speed;
    private int level = 1;
    private int xpbar = 0;
    private int endbar = 100;
    private int gold = 20;
    private String weaponDescription;


    //deal with chance effects
    Random rand = new Random();
    ArrayList<String> StartingWeapons = new ArrayList<>();
    //Enemy class
    Enemy enemy;
    //timer for delays
    Timer timer = new Timer();
    //for inputs
    Scanner scan = new Scanner(System.in);

    //backpack for player
    HashMap<String, Integer> backpack = new HashMap<>();





    public Player(int hp, int level){

        this.hp = hp;
        this.level = 1;

        backpack.put("Health Potion", 2);
    }


    public int atkrange(int min, int max){
        return rand.nextInt(max - min + 1) + min;
    }

    public HashMap<String, Integer> getBackpack() {
        return backpack;
    }

    public void setBackpack(HashMap<String, Integer> backpack) {
        this.backpack = backpack;
    }

    public int getGold() {
        return gold;
    }

    public void setGold(int gold) {
        this.gold = gold;
    }

    public String getWeapon() {
        return Weapon;
    }

    public void setWeapon(String weapon) {
        Weapon = weapon;
    }

    public int getSpeed() {
        return speed;
    }

    public void setSpeed(int speed) {
        this.speed = speed;
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

    public int getCrit() {
        return crit;
    }

    public void setCrit(int crit) {
        this.crit = crit;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public int getXpbar() {
        return xpbar;
    }

    public void setXpbar(int xpbar) {
        this.xpbar = xpbar;
    }

    public int getEndbar() {
        return endbar;
    }

    public void setEndbar(int endbar) {
        this.endbar = endbar;
    }

    public void check(){
        switch(this.getWeapon()){
            case "Rusted Dagger":
                this.atk = atkrange(2,4);
                this.crit = 35;
                this.weaponDescription = "A sword that was crafted out of some dusty wood on a cool weekday. Make sure not to overuse it";
                break;
            case "Wooden Sword":
                this.atk = atkrange(5,8);
                this.crit = 10;
                this.weaponDescription = "A dagger that has gone past its usefulness. Might be able to inflict minor wounds";
                break;
            case "Old Scythe":
                this.atk = atkrange(1,4);
                this.crit = 60;
                this.weaponDescription = "A scythe that was handled with care until its owner passed away. You feel as if it yearns to be used once more";
                break;
        }
    }
    public void levelup(){
        if(xpbar >= endbar){
            xpbar = 0;
            level++;
            hp += 10;
        }
        endbar += 25;
    }
    //Helps to adjust battle flow and other time stuff
    private void addDelay(int milliseconds) {
        try {
            Timer timer = new Timer();
            TimerTask task = new TimerTask() {
                @Override
                public void run() {
                    synchronized (this) {
                        this.notify();
                    }
                }
            };

            synchronized (task) {
                timer.schedule(task, milliseconds);
                task.wait(); // Wait for the timer to complete
            }
            timer.cancel(); // Clean up the timer
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public void start() {
        boolean weaponselected = false;
        System.out.println("Welcome traveler to the world of Rashinova.");
        addDelay(2500);
        System.out.println("Rashinova used to be a peaceful realm until it fell to the clutches of evil and now its a home for monsters and evil alike.");
        addDelay(3500);
        System.out.println("Please take up arms and bring peace back to Rashinova traveler");
        addDelay(2500);
        System.out.println("-----------------------------------------------------------------");

        addDelay(4000);
        System.out.println("A traveler cannot be safe without a trusty weapon at their side. It's unfortunate that we only have these basic weapons but please pick one!");
        addDelay(3000);
        while (weaponselected != true) {
            System.out.println("Wooden Sword\n" +
                    "AtkR: 5-8\n" +
                    "Crit Chance: 10%\n" +
                    "--------------------\n" +
                    "Rusted Dagger\n" +
                    "AtkR: 2-4\n" +
                    "Crit Chance: 35%\n" +
                    "-------------------\n" +
                    "Old Scythe\n" +
                    "AtkR: 1-4\n" +
                    "Crit Chance:60%");

            String weaponselection = scan.nextLine();
            switch (weaponselection) {
                case "Wooden Sword":
                    System.out.println("Wooden Sword -");

                    addDelay(2750);
                    System.out.println("Will you travel with this weapon?\n" +
                            "Y-N");
                    String s4 = scan.nextLine();
                    if (s4.equals("Y")) {
                        weaponselected = true;
                        this.setWeapon(weaponselection);
                        break;
                    }
                    break;
                case "Rusted Dagger":
                    System.out.println("Rusted Dagger -");

                    addDelay(2750);
                    System.out.println("Will you travel with this weapon?\n" +
                            "Y-N");
                    String s5 = scan.nextLine();
                    if (s5.equals("Y")) {
                        weaponselected = true;
                        this.setWeapon(weaponselection);
                        break;
                    }
                    break;
                case "Old Scythe":
                    System.out.println("Old Scythe -");

                    addDelay(2750);
                    System.out.println("Will you travel with this weapon?\n" +
                            "Y-N");
                    String s6 = scan.nextLine();
                    if (s6.equals("Y")) {
                        weaponselected = true;
                        this.setWeapon(weaponselection);
                        break;
                    }
                    break;
            }
        }

    }
    public void battle(){
        Scanner scan = new Scanner(System.in);
        Enemy enemy = new Enemy();
        System.out.println("Battling against" + " " + enemy.getName());
        //We exit this loop once either player or enemy reaches 0 hp
        outerloop:
        while(enemy.getHp() > 0 || this.getHp() > 0){
            int reduction = 0;
            boolean crit = false;
            boolean turndone = false;
            System.out.println("Player choose your action");
            while(turndone == false) {
                System.out.println("Player HP: " + this.getHp() + "                             " + "Monster HP: " + enemy.getHp());
                System.out.println("1. Attack with " + this.getWeapon() + "\n" +
                        "2. Bag\n" +
                        "3. Monster Info");
                int s1 = scan.nextInt();
                switch (s1) {
                    case 1:
                        this.check();
                        int damage = this.getAtk();
                        //Calculating defense to get our new damage
                        int critcheck = rand.nextInt(100 + 1);
                        if (critcheck <= this.getCrit()) {
                            damage *= 2;
                            System.out.println("Your " + this.getWeapon() + " feels light in your hands");
                        }
                        if (enemy.getDef() != 0) {
                            reduction = (enemy.getDef() / 100) * this.getAtk();
                            System.out.println("The enemy's defense proves to be formidable");
                            addDelay(1000);
                        }
                        enemy.setHp(enemy.getHp() - (damage - reduction));
                        System.out.println("Player hits enemy for " + damage + " damage");
                        turndone = true;
                        addDelay(1500);
                        if (enemy.getHp() <= 0) {
                            System.out.println("Player wins!!!\n " +
                                    "Earned " + enemy.getXp() + " xp\n" +
                                    "Earned " + enemy.getGold() + " gold");
                            System.out.println("---------------------------------------------------");
                            enemy.death(this);
                            this.setGold(this.getGold() + enemy.getGold());
                            break outerloop;
                        }
                        break;
                    case 2:
                        int oghp = this.getHp();
                        this.checkbag();
                        if(this.getHp() != oghp){
                            turndone = true;
                        }
                        break;
                    case 3:
                        System.out.println(enemy.getDescription());
                        addDelay(1500);
                        break;
                }
            }

            enemy.checkEnemy();
            System.out.println("Enemy hits player for " + enemy.getAtk() + " damage");
            this.setHp(this.getHp() - enemy.getAtk());
            if(this.getHp() <= 0){
                System.out.println("Game Over. Darkness will now consume Rashinova");
                break;
            }
            System.out.println("---------------------------------------------------");
            addDelay(1000);
        }
        addDelay(500);
        System.out.println("Current XP is:"  + this.getXpbar());
        if(this.getXpbar() >= this.getEndbar()){
            levelup();
        }
    }
    public void checkbag() {
        boolean t = true;
        while (t) {
            for (String i : backpack.keySet()) {
                System.out.println(i + ": " + backpack.get(i));
            }
            String bagcheck = scan.nextLine();

            switch (bagcheck) {
                case "Health Potion":
                    if (backpack.get("Health Potion") <= 0) {
                        System.out.println("You don't have any of this item");
                        break;
                    }
                    System.out.println("Consume a Health Potion?\n" +
                            "Y/N");
                    String yncheck = scan.nextLine();
                    if(yncheck.equals("Y")){
                        backpack.put("Health Potion", backpack.get("Health Potion") - 1);
                        System.out.println("The red liquid surges through your body\n" +
                                "+20 hp!");
                        this.setHp(this.getHp() + 20);
                        t = false;
                    } else {
                        break;
                    }
                    break;

                case "Exit":
                    t = false;
                    break;
            }

        }
    }
    public void consume(String item){
        switch(item){
            case "Health Potion":
                System.out.println("You chug the red liquid in one gulp");
                addDelay(2500);
                System.out.println("HP increases by 20!");
                this.setHp(this.getHp() + 20);
                break;
        }
    }
    public void shop(){
        System.out.println("You walk into a dusty tavern with a shopkeeper who could be as old as the kingdom itself");
        addDelay(3500);
        System.out.println("Shopkeeper: Welcome traveler to my home away from monsters. Leave your money at the front and move along with your way once your done");
        addDelay(5500);
        innerloop:
        while(true) {
            System.out.println("Health Potion - 20 gold\n" +
                    "Leave?");
            String shopcheck = scan.nextLine();
            switch (shopcheck) {
                case "Health Potion":
                    System.out.println("How many health potions should I buy?");
                    int hpshopcheck = scan.nextInt();
                    scan.nextLine();
                    if (this.getGold() > hpshopcheck * 20) {
                        System.out.println("Added " + hpshopcheck + " health potions into your bag");
                        this.backpack.put("Health Potion", backpack.get("HealthPotion") + hpshopcheck);
                        addDelay(2500);
                    } else {
                        System.out.println("Looks like I can't afford this much");
                    }
                    break;
                case "Leave":
                    System.out.println("Safe journey out there traveler.");
                    addDelay(2500);
                    break innerloop;
            }
        }
    }
}