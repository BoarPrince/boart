SELECT
  * -- ######### Company ########
,
  (
    SELECT
      * -- ######### Company -> Address ########
    FROM
      [ADDRESS] a
    WHERE
      a.ID = co.ADDRESS_ID FOR JSON PATH
  ) AS [ADDRESS],
  (
    SELECT
      * -- ######### Company -> Phonenumber ###########
    FROM
      [PHONE_NUMBER] p
    WHERE
      p.ID = co.PHONE_NUMBER_ID FOR JSON PATH
  ) AS [PHONE_NUMBER],
  (
    SELECT
      * -- ######### Company -> Carrier ###########
,
      (
        SELECT
          * -- ######### Company -> Carrier -> Address ###########
        FROM
          [ADDRESS] a
        WHERE
          a.ID = ca.ADDRESS_ID FOR JSON PATH
      ) AS [ADDRESS],
      (
        SELECT
          * -- ######### Company -> Carrier -> PhoneNumber ###########
        FROM
          [PHONE_NUMBER] p
        WHERE
          p.ID = ca.PHONE_NUMBER_ID FOR JSON PATH
      ) AS [PHONE_NUMBER],
      (
        SELECT
          STRING_AGG(CONVERT(VARCHAR(36), COALESCE(ca_u.ID, '')), ',') AS UserIDs
        FROM
          FLEET_USER_SUBSIDIARY ca_us
          INNER JOIN FLEET_USER ca_u ON ca_us.USER_ID = ca_u.ID
          AND ca_us.SUBSIDIARY_ID = ca.ID
      ) AS UserIDs,
      (
        SELECT
          * -- ######### Company -> Carrier -> Driver ###########
        FROM
          [DRIVER] d
        WHERE
          d.SUBSIDIARY_ID = ca.ID FOR JSON PATH
      ) AS [DRIVERS],
      (
        SELECT
          * -- ######### Company -> Carrier -> Driver ###########
        FROM
          [VEHICLE] v
        WHERE
          v.SUBSIDIARY_ID = ca.ID FOR JSON PATH
      ) AS [VEHICLES]
    FROM
      SUBSIDIARY ca
    WHERE
      ca.COMPANY_ID = co.ID FOR JSON PATH
  ) AS [CARRIERS],
  (
    SELECT
      * -- ######### Company -> User ###########
,
      (
        SELECT
          * -- ######### Company -> User -> PhoneNumber ###########
        FROM
          [PHONE_NUMBER] p
        WHERE
          p.ID = u.PHONE_NUMBER_ID FOR JSON PATH
      ) AS [PHONE_NUMBER],
      (
        SELECT
          STRING_AGG(ro.NAME, ',') AS [GROUPS]
        FROM
          FLEET_ROLE ro
          INNER JOIN FLEET_USER_ROLE uro ON ro.ID = uro.ROLE_ID
          AND uro.USER_ID = u.ID
      ) AS [GROUPS]
    FROM
      FLEET_USER u
    WHERE
      u.COMPANY_ID = co.ID
      OR u.ID IN (
        SELECT
          ca_u.ID
        FROM
          FLEET_USER ca_u
          INNER JOIN FLEET_USER_SUBSIDIARY ca_us ON ca_us.USER_ID = ca_u.ID
          INNER JOIN SUBSIDIARY ca ON ca.ID = ca_us.SUBSIDIARY_ID
          AND ca.COMPANY_ID = co.ID
      ) FOR JSON PATH
  ) AS [USERS]
FROM
  Company co
WHERE
  co.id = '${store:companyInfo.id}' FOR JSON PATH
