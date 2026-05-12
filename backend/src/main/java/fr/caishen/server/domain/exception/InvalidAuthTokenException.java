package fr.caishen.server.domain.exception;

public class InvalidAuthTokenException extends RuntimeException {
    public InvalidAuthTokenException() {
        super("Invalid authentication token");
    }
}
