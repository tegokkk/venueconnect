export async function recordAuditEvent(tx, event) {
  return tx.auditEvent.create({
    data: {
      actorId: event.actorId ?? null,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      requestId: event.requestId ?? null,
      metadata: event.metadata ?? undefined
    }
  });
}
