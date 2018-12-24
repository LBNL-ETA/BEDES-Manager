insert into
    public.bedes_term_sector_link (term_id, sector_id)
values
    (${_termId}, ${_sectorId})
returning
    id as "_id",
    sector_id as "_sectorId"
;