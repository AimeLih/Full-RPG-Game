package com.aimestart.rpggameback;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping
public class PlayerController {

    private final GameStateService gameStateService;
    private final LeaderboardService leaderboardService;

    public PlayerController(GameStateService gameStateService, LeaderboardService leaderboardService) {
        this.gameStateService = gameStateService;
        this.leaderboardService = leaderboardService;
    }

    @PostMapping("/start")
    public GameStateResponse Beginning() {
        return gameStateService.startGame();
    }

    @GetMapping("/state")
    public GameStateResponse currentState() {
        return gameStateService.getCurrentState();
    }

    @PostMapping("/weaponselect/{weaponname}")
    public GameStateResponse SelectWeapon(@PathVariable String weaponname) {
        return gameStateService.selectWeapon(weaponname);
    }

    @PostMapping("/modeselect/{mode}")
    public GameStateResponse selectMode(@PathVariable String mode) {
        return gameStateService.selectMode(mode);
    }

    @PostMapping("/itemselect/{item}")
    public GameStateResponse SelectItem(@PathVariable String item) {
        return gameStateService.selectItem(item);
    }

    @PostMapping("/itemuse/{item}")
    public BattleResponse UseItem(@PathVariable String item) {
        return gameStateService.useItem(item);
    }

    @PostMapping("/battle/start")
    public BattleResponse startBattle() {
        return gameStateService.startBattle();
    }

    @PostMapping("/battle/attack")
    public BattleResponse attack() {
        return gameStateService.attack();
    }

    @PostMapping("/nextday")
    public int nextday() {
        return gameStateService.nextDay();
    }

    @GetMapping("/leaderboard")
    public List<LeaderboardEntryResponse> leaderboard() {
        return leaderboardService.listEntries();
    }

    @PostMapping("/leaderboard")
    public LeaderboardEntryResponse submitLeaderboard(@RequestBody LeaderboardSubmissionRequest request) {
        return leaderboardService.submit(request);
    }
}
