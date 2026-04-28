package com.aimestart.rpggameback;

import java.time.Instant;

public class LeaderboardEntryResponse {
    private Long id;
    private String playerName;
    private int level;
    private int day;
    private String outcome;
    private String enemyName;
    private String summary;
    private Instant createdAt;

    public static LeaderboardEntryResponse from(LeaderboardEntry entry) {
        LeaderboardEntryResponse response = new LeaderboardEntryResponse();
        response.setId(entry.getId());
        response.setPlayerName(entry.getPlayerName());
        response.setLevel(entry.getLevel());
        response.setDay(entry.getDay());
        response.setOutcome(entry.getOutcome());
        response.setEnemyName(entry.getEnemyName());
        response.setCreatedAt(entry.getCreatedAt());
        if ("VICTORY".equals(entry.getOutcome())) {
            response.setSummary("This player has saved Rashinova");
        } else {
            response.setSummary("Fell on day " + entry.getDay() + " to " + entry.getEnemyName());
        }
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public int getDay() {
        return day;
    }

    public void setDay(int day) {
        this.day = day;
    }

    public String getOutcome() {
        return outcome;
    }

    public void setOutcome(String outcome) {
        this.outcome = outcome;
    }

    public String getEnemyName() {
        return enemyName;
    }

    public void setEnemyName(String enemyName) {
        this.enemyName = enemyName;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
