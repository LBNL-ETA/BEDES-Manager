where scope_id != 1
  and (scope_id NOT IN (
${_excludedScopes:csv}
)
)
