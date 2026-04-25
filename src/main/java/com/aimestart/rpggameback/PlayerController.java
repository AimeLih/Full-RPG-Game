package com.aimestart.rpggameback;

import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Random;

@RestController

@CrossOrigin(origins = "http://localhost:5173")

@RequestMapping
public class PlayerController {
    Random rand = new Random();
    private int day = 0;
    private Player player1;
    Enemy currentenemy;


    @PostMapping("/start")
    public GameStateResponse Beginning(){
         player1 = new Player(100,1);
        return new GameStateResponse(
                player1.getHp(),
                player1.getLevel(),
                Arrays.asList("Wooden Sword", "Rusted Dagger", "Old Scythe")
        );
    }

    @PostMapping("/weaponselect/{weaponname}")
    public GameStateResponse SelectWeapon(@PathVariable String weaponname){
    player1.setWeapon(weaponname);
    player1.check();
    return new GameStateResponse(
           player1
    );
    }

    @PostMapping("/itemselect/{item}")
    public GameStateResponse SelectItem(@PathVariable String item){
        player1.backpack.put(item, player1.backpack.get(item) + 1);
        return new GameStateResponse(
                player1
        );
    }

    @PostMapping("/itemuse/{item}")
    public BattleResponse UseItem(@PathVariable String item){
        player1.backpack.put(item, player1.backpack.get(item) - 1);

        String useMessage;

        switch (item) {
            case "Health Potion":
                player1.setHp(player1.getHp() + 20);
                useMessage = "You drink the potion. +20 HP!";
                break;
            default:
                useMessage = "You used " + item + ".";
        }

        currentenemy.checkEnemy();
        int enemyDmg = currentenemy.getAtk();
        player1.setHp(player1.getHp() - enemyDmg);
        useMessage += " Enemy strikes back for " + enemyDmg + "!";

        return new BattleResponse(
                currentenemy.getHp(),
                0,
                enemyDmg,
                currentenemy.getDescription(),
                player1.getHp(),
                currentenemy.getName(),
                useMessage,
                ""
        );
    }

    @PostMapping("/battle/start")
    public BattleResponse startBattle(){
        currentenemy = new Enemy();
        return new BattleResponse(
                currentenemy.getHp(),
                0,
                0,
                currentenemy.getDescription(),
                player1.getHp(),
                currentenemy.getName(),
                "Enemy Created",
                ""
        );
    }
    @PostMapping("/battle/attack")
    public BattleResponse attack() {
        player1.check();
        int damage = player1.getAtk();
        int reduction = 0;
        boolean crit = false;

        Random rand = new Random();
        int critcheck = rand.nextInt(100) + 1;
        if (critcheck <= player1.getCrit()) {
            damage *= 2;
            crit = true;
        }

        if (currentenemy.getDef() != 0) {
            reduction = (currentenemy.getDef() / 100) * player1.getAtk();
        }

        currentenemy.setHp(currentenemy.getHp() - (damage - reduction));

        String hitMessage = "";
        if(crit){
            hitMessage = "Your " + player1.getWeapon() + " feels light — CRITICAL HIT for " + damage + " damage!";
        } else {
          hitMessage =  "You strike with your " + player1.getWeapon() + " for " + damage + " damage.";
        }


        String finalMessage;
        String counterMessage;
        int enemyDmg = 0;

        if (currentenemy.getHp() <= 0) {
            finalMessage   = "Victory! " + currentenemy.getName() + " has fallen.";
            counterMessage = "";
        } else {
            // Enemy only counters if still alive
            currentenemy.checkEnemy();
             enemyDmg = currentenemy.getAtk();
            player1.setHp(player1.getHp() - enemyDmg);

            finalMessage = hitMessage;

            if (player1.getHp() <= 0) {
                counterMessage = "Darkness consumes you...";
            } else if (player1.getHp() <= 15) {
                counterMessage = currentenemy.getName() + " retaliates for " + enemyDmg + ". You are barely standing!";
            } else {
                counterMessage = currentenemy.getName() + " strikes back for " + enemyDmg + " damage.";
            }
        }

        return new BattleResponse(
                currentenemy.getHp(),
                damage,
                enemyDmg,
                currentenemy.getDescription(),
                player1.getHp(),
                currentenemy.getName(),
                finalMessage,
                counterMessage
        );
    }

    @PostMapping("/nextday")
    public int nextday(){
        day++;
        return day;
    }



}
