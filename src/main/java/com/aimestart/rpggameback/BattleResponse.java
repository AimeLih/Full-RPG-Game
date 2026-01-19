package com.aimestart.rpggameback;

public class BattleResponse {


    private int playerdamage;
    private int enemydamge;
   private int Enemyhp;
    private int Playerhp;
    private String Enemyname;
    private String message;



    BattleResponse(int Enemyhp, int playerdamage, int enemydamge, int Playerhp, String Enemyname, String message){
        this.Enemyhp = Enemyhp;
        this.Playerhp = Playerhp;
        this.playerdamage = playerdamage;
        this.enemydamge = enemydamge;
        this.Enemyname = Enemyname;
        this.message = message;

    }
    public int getPlayerdamage() {
        return playerdamage;
    }

    public void setPlayerdamage(int playerdamage) {
        this.playerdamage = playerdamage;
    }



    public int getEnemydamge() {
        return enemydamge;
    }

    public void setEnemydamge(int enemydamge) {
        this.enemydamge = enemydamge;
    }

    public int getEnemyhp() {
        return Enemyhp;
    }

    public void setEnemyhp(int enemyhp) {
        Enemyhp = enemyhp;
    }

    public int getPlayerhp() {
        return Playerhp;
    }

    public void setPlayerhp(int playerhp) {
        Playerhp = playerhp;
    }
}
