package fr.caishen.server.domain.exception;

public class UserAlreadyInGroupException extends Exception {
    public UserAlreadyInGroupException(String message) {
        super(message);
    }
}
