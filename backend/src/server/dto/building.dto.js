export function toBuildingDto(building) {
  return {
    id: building.id,
    slug: building.slug,
    name: building.name,
    description: building.description,
    location: building.location,
    capacity: building.capacity,
    internalLoanEnabled: building.internalLoanEnabled,
    publicRentalEnabled: building.publicRentalEnabled,
    facilities: (building.facilities ?? []).map(({ detail, facility }) => ({
      detail,
      facility: {
        id: facility.id,
        name: facility.name,
        description: facility.description
      }
    })),
    rates: (building.rates ?? []).map((rate) => ({
      id: rate.id,
      name: rate.name,
      audienceType: rate.audienceType,
      amount: rate.amount.toString(),
      currency: rate.currency,
      unit: rate.unit,
      validFrom: rate.validFrom,
      validUntil: rate.validUntil,
      isBookable: rate.isBookable,
      maxDurationMinutes: rate.maxDurationMinutes
    }))
  };
}

export function toBuildingBlockDto(block) {
  return {
    id: block.id,
    startsAt: block.startsAt,
    endsAt: block.endsAt,
    reason: block.reason,
    createdAt: block.createdAt
  };
}
