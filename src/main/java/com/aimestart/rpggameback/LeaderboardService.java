package com.aimestart.rpggameback;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@Transactional
public class LeaderboardService {
    private static final String ENDLESS_MODE = "ENDLESS";

    private final LeaderboardEntryRepository repository;

    public LeaderboardService(LeaderboardEntryRepository repository) {
        this.repository = repository;
    }

    public LeaderboardEntryResponse submit(LeaderboardSubmissionRequest request) {
        String playerName = request.getPlayerName() == null ? "" : request.getPlayerName().trim();
        if (playerName.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Please enter a player name.");
        }
        if (playerName.length() > 40) {
            throw new ResponseStatusException(BAD_REQUEST, "Player name must be 40 characters or less.");
        }
        if (request.getLevel() <= 0) {
            throw new ResponseStatusException(BAD_REQUEST, "Level must be greater than 0.");
        }
        if (request.getDay() <= 0) {
            throw new ResponseStatusException(BAD_REQUEST, "Day must be greater than 0.");
        }

        String outcome = request.getOutcome() == null ? "" : request.getOutcome().trim().toUpperCase();
        if (!"DEFEAT".equals(outcome)) {
            throw new ResponseStatusException(BAD_REQUEST, "Only endless-mode defeats past day 20 can enter the leaderboard.");
        }

        String gameMode = request.getGameMode() == null ? "" : request.getGameMode().trim().toUpperCase();
        if (!ENDLESS_MODE.equals(gameMode)) {
            throw new ResponseStatusException(BAD_REQUEST, "Only endless-mode defeats past day 20 can enter the leaderboard.");
        }
        if (request.getDay() <= 20) {
            throw new ResponseStatusException(BAD_REQUEST, "You must survive past day 20 in endless mode to enter the leaderboard.");
        }
        String enemyName = request.getEnemyName() == null ? null : request.getEnemyName().trim();
        if (enemyName == null || enemyName.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "A defeating enemy is required for defeat entries.");
        }

        LeaderboardEntry entry = new LeaderboardEntry();
        entry.setPlayerName(playerName);
        entry.setLevel(request.getLevel());
        entry.setDay(request.getDay());
        entry.setOutcome(outcome);
        entry.setEnemyName(enemyName);

        return LeaderboardEntryResponse.from(repository.save(entry));
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntryResponse> listEntries() {
        return repository.findTop25ByOrderByCreatedAtDesc()
                .stream()
                .map(LeaderboardEntryResponse::from)
                .toList();
    }
}
