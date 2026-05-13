package fr.caishen.server.domain.exception;

public class GroupAccessDeniedException extends RuntimeException {
    public GroupAccessDeniedException() {
        super("Current user is not a member of this group");
    }
}
