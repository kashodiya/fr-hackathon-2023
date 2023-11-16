# DANG!
- This is a hackathon project from FR 2023
- It shows relationships of banks and crypto exchanges
- Data model
    - bank_entity.csv: bank_id,bank_type,entity_type
    - crypto_entity.csv: crypto_id,crypto_type,entity_type
    - bank_to_crypto_relationship.csv: bank_id,relationship_type,crypto_id
    - crypto_to_bank_relationship.csv: crypto_id,relationship_type,bank_id
    - crypto_to_crypto_relationship.csv: crypto_id_from,relationsihp_type,crypto_id_to

## Errors in original data
- Duplicates in crypto_entity.csv
