package com.aimestart.rpggameback;

public class BattleResponse {


    private int playerdamage;
    private int enemydamge;
    private String enemydescription;
   private int Enemyhp;
    private int Playerhp;
    private String Enemyname;
    private String message;
    private String countermessage;


    BattleResponse(int Enemyhp, int playerdamage, int enemydamge, String enemydescription,int Playerhp, String Enemyname, String message, String countermessage){
        this.Enemyhp = Enemyhp;
        this.Playerhp = Playerhp;
        this.playerdamage = playerdamage;
        this.enemydamge = enemydamge;
        this.Enemyname = Enemyname;
        this.enemydescription = enemydescription;
        this.message = message;
        this.countermessage = countermessage;

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

    public String getEnemydescription() {
        return enemydescription;
    }
    public void setEnemydescription(String enemydescription) {
        this.enemydescription = enemydescription;
    }
    public String getEnemyname() {
        return Enemyname;
    }
    public void setEnemyname(String enemyname) {
        Enemyname = enemyname;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }

    public String getCountermessage() {
        return countermessage;
    }
    public void setCountermessage(String countermessage) {
        this.countermessage = countermessage;
    }
}
