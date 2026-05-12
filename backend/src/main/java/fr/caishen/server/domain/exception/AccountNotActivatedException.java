package fr.caishen.server.domain.exception;

public class AccountNotActivatedException extends RuntimeException {
    public AccountNotActivatedException() {
        super("Account is not activated");
    }
}
