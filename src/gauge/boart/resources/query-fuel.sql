SELECT
  * -- carrier
,
  (
    SELECT
      * -- carrier -> user
,
      (
        SELECT
          JSON_QUERY(
            CONCAT(
              '[',
              STRING_AGG(CONCAT('"', ro.name, '"'), ','),
              ']'
            )
          )
        FROM
          fuel_role ro
          INNER JOIN fuel_user_role uro ON uro.role_id = ro.id
          AND uro.user_id = u.id
      ) AS roles
    FROM
      fuel_user u
    WHERE
      u.carrier_id = ca.id FOR JSON PATH
  ) AS users -- phone numbers
,
  (
    SELECT
      p.* -- carrier -> phoneNumbers
    FROM
      phonenumber p
      INNER JOIN carrier_phone_numbers cp ON cp.phone_numbers_id = p.id
      AND cp.carrier_id = ca.id FOR JSON PATH
  ) AS phoneNumbers,
  (
    SELECT
      ad.* -- carrier -> addresses
    FROM
      [address] ad
      INNER JOIN carrier_addresses cad ON cad.addresses_id = ad.id
      AND cad.carrier_id = ca.id FOR JSON PATH
  ) AS addresses,
  (
    SELECT
      * -- carrier -> driver
    FROM
      driver d
    WHERE
      d.carrier_id = ca.id FOR JSON PATH
  ) AS drivers,
  (
    SELECT
      * -- carrier -> vehicle
    FROM
      vehicle v
    WHERE
      v.carrier_id = ca.id FOR JSON PATH
  ) AS vehicles
FROM
  carrier ca
WHERE
  ca.external_id = '${store:carrierInfo.id:-${store:carrierId}}' FOR JSON PATH
