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
    public GameStateResponse UseItem(@PathVariable String item){
        player1.backpack.put(item, player1.backpack.get(item) - 1);
        return new GameStateResponse(player1);
    }

    @PostMapping("/battle/start")
    public BattleResponse startBattle(){
        currentenemy = new Enemy();
        return new BattleResponse(
                currentenemy.getHp(),
                0,
                0,
                player1.getHp(),
                currentenemy.getName(),
                "Enemy Created"
        );
    }
    @PostMapping("/battle/attack")
    public BattleResponse attack(){
        player1.check();
        int dmg = player1.getAtk();

        int critcheck = rand.nextInt(101);
        boolean critornaw = critcheck <= player1.getCrit();
        if (critornaw) {
            dmg *= 2;
        }


        int reduction = 0;
        if (currentenemy.getDef() != 0) {
            reduction = (currentenemy.getDef() / 100) * dmg;
        }
        currentenemy.setHp(currentenemy.getHp() - (dmg - reduction));

        String message = "Continue";


        if(currentenemy.getHp() <= 0){
            currentenemy.death(player1); // Award XP
            player1.setGold(player1.getGold() + currentenemy.getGold());
            if(player1.getXpbar() >= player1.getEndbar()){
                player1.levelup();
            }
            message = "Victory! Gained " + currentenemy.getXp() + " XP and " + currentenemy.getGold() + " gold";
            return new BattleResponse(0, dmg - reduction, 0, player1.getHp(),  currentenemy.getName(), message);
        }


        currentenemy.checkEnemy();
        int edmg = currentenemy.getAtk();
        player1.setHp(player1.getHp() - edmg);


        if(player1.getHp() <= 0){
            message = "Game Over";
        }

        return new BattleResponse(
                currentenemy.getHp(),
                dmg - reduction,
                edmg,
                player1.getHp(),

                currentenemy.getName(),
                message
        );
    }

    @PostMapping("/nextday")
    public int nextday(){
        day++;
        return day;
    }



}
