package com.aimestart.rpggameback;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaderboardEntryRepository extends JpaRepository<LeaderboardEntry, Long> {
    List<LeaderboardEntry> findTop25ByOrderByCreatedAtDesc();
}
