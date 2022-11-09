# 1. Onboarding Fleet

tags: env-all, onboarding, ob-10

## 1.1. Send Onboarding Events manually

tags: ob-10.1

* Test description

   |action     |value                              |
   |-----------|-----------------------------------|
   |description|Send Onboarding Event to Masterdata|
   |priority   |high                               |

* queues bind "company, user"

* RabbitMQ publish

   |action        |value                                 |
   |--------------|--------------------------------------|
   |description   |Send onboarding event manually        |
   |exchange      |com.jitpay.company.onboarding         |
   |routing       |JitpayServicesSync.RoutingKey         |
   |routing       |company-onboarding-data-sync-to-portal|
   |payload       |<file:event-onboarding.json>          |
   |wait:after:sec|4                                     |

* RabbitMQ publish

   |action        |value                                |
   |--------------|-------------------------------------|
   |description   |Send portal onboarding event manually|
   |exchange      |fleet_event_bus                      |
   |wait:after:sec|4                                    |
   |routing       |OnBoardingFleetEvent                 |
   |payload       |<file:event-portal-onboarding.json>  |

* queues check "company, user"

* Data manage

   |action                                   |value                                             |
   |-----------------------------------------|--------------------------------------------------|
   |in                                       |${store:event-company}                            |
   |description                              |Check Masterdata -> External Event                |
   |                                         |And check that the user contains the correct roles|
   |expected:count#carriers[0].users[0].roles|2                                                 |
   |expected#carriers[0].users[0].roles      |["CarrierAdmin","CustomerAdmin"]                  |

* request admin bearer

* Rest call

   |action                                   |value                                             |
   |-----------------------------------------|--------------------------------------------------|
   |method:get                               |/api/company/${generate:t:tpl:company.id}         |
   |description                              |Request onboarded company                         |
   |                                         |And check that the user contains the correct roles|
   |expected:header#status                   |200                                               |
   |expected:count#carriers[0].users[0].roles|2                                                 |
   |expected#carriers[0].users[0].roles      |["CarrierAdmin","CustomerAdmin"]                  |

## 1.2. Send Onboarding Events manually and check id's

tags: ob-10.2

* Test description

   |action     |value                                                      |
   |-----------|-----------------------------------------------------------|
   |description|Send Onboarding Event to Masterdata manually and check id's|
   |priority   |high                                                       |

* queues bind "user, company, carrier, company-onboarding, fleet-event-bus, identity, fleet-error, md-error"

* RabbitMQ publish

   |action        |value                                                |
   |--------------|-----------------------------------------------------|
   |description   |Send event to identity to create the user on keycload|
   |exchange      |Identity.Exchange                                    |
   |routing       |Identity.UserSync                                    |
   |payload       |<file:event-identity.json>                           |
   |wait:after:sec|4                                                    |

* RabbitMQ publish

   |action        |value                         |
   |--------------|------------------------------|
   |description   |Send onboarding event manually|
   |exchange      |com.jitpay.company.onboarding |
   |wait:after:sec|2                             |
   |routing       |JitpayServicesSync.RoutingKey |
   |payload       |<file:event-onboarding.json>  |

* RabbitMQ publish

   |action        |value                                |
   |--------------|-------------------------------------|
   |description   |Send portal onboarding event manually|
   |exchange      |fleet_event_bus                      |
   |wait:after:sec|4                                    |
   |routing       |OnBoardingFleetEvent                 |
   |payload       |<file:event-portal-onboarding.json>  |

* queues check "user, company, carrier, company-onboarding, fleet-event-bus, identity, fleet-error, md-error"

* onboarding - check matching ids, email: "${store:ob-email}", group: "check IDs", wait: "0", not: "portal"

## 1.3. Id's must match after onboarding

tags: ob-10.3

* Test description

   |action     |value                                                                      |
   |-----------|---------------------------------------------------------------------------|
   |description|After Onboarding ID's must be the same for all backends, including keycloak|
   |priority   |high                                                                       |

* queues bind "user, company, carrier, company-onboarding, fleet-event-bus, identity, fleet-error, md-error"

* onboarding - complete

* queues check "user, company, carrier, company-onboarding, fleet-event-bus, identity, fleet-error, md-error", min: "1", max: "10"

* onboarding - check matching ids, email: "${store:response-register.email}", group: "check IDs", wait: "0", not: ""
comment * onboarding - check matching ids, email: "${store:response-register.email}", group: "check IDs second time after 10 seconds", wait: "10"

comment * onboarding - check matching ids, email: "jitpaytest+onb39492@gmail.com", group: "check IDs", wait: "0"

## 1.4. Id's must match after onboarding event when debtor already exists (tax - match)

tags: ob-10.4

* Test description

   |action     |value                                                                      |
   |-----------|---------------------------------------------------------------------------|
   |description|After Onboarding ID's must be the same for all backends, including keycloak|
   |           |Debtor with same taxId already exists                                      |
   |           |In this case the companyId of the existing Debtor must be used             |
   |priority   |high                                                                       |

* request admin bearer

* Rest call

   |action                |value                            |
   |----------------------|---------------------------------|
   |method:post           |<portal>/api/company             |
   |payload               |<file:request-portal-debtor.json>|
   |description           |Create a portal debtor           |
   |expected:header#status|201                              |
   |store#taxNumber       |company.taxId                    |
   |store#name            |company.name                     |
   |store#taxNumber       |debtor.taxId                     |
   |store#id              |debtor.id                        |

* queues bind "company-consumer, fleet-error, md-error"

* onboarding - complete

* queues check "company-consumer, fleet-error, md-error"

## 1.5. Id's must match after onboarding event when debtor already exists (tax - match)

tags: ob-10.5

* Test description

   |action     |value|
   |-----------|-----|
   |description|XXXX |
   |priority   |high |

* queues bind "fleet-event-bus, portal-error"

* RabbitMQ publish

   |action                  |value                         |
   |------------------------|------------------------------|
   |description             |Send onboarding event manually|
   |exchange                |com.jitpay.company.onboarding |
   |wait:after:sec          |3                             |
   |routing                 |JitpayServicesSync.RoutingKey |
   |payload                 |<file:event-onboarding.json>  |
   |payload#companyDto.state|CREATED                       |

* RabbitMQ publish

   |action                  |value                         |
   |------------------------|------------------------------|
   |description             |Send onboarding event manually|
   |exchange                |com.jitpay.company.onboarding |
   |wait:after:sec          |3                             |
   |routing                 |JitpayServicesSync.RoutingKey |
   |payload                 |<file:event-onboarding.json>  |
   |payload#companyDto.state|REGISTERED                    |

* queues check "fleet-event-bus, portal-error"

## 1.6. If portal is sending the event (fleet event bus) more than one time, the carrier must always be the same (manual check)

tags: ob-10.6

* Test description

   |action     |value                                                                                          |
   |-----------|-----------------------------------------------------------------------------------------------|
   |description|portal can send the fleet_event_bus event more than one times.                                 |
   |           |In any case the carrierId should not be changed by the master data backend.                    |
   |           |* Master data is updating the keycloak subsidiary all the time with the first created carrierId|
   |           |* The first update has eventType: CREATE, all other updates has the eventType: UPDATE          |
   |priority   |high                                                                                           |

* request admin bearer

* Rest call

   |action                |value                            |
   |----------------------|---------------------------------|
   |method:post           |/api/company                     |
   |description           |Create a Company without jitpayId|
   |group                 |Initial Create                   |
   |payload               |<file:request-company.json>      |
   |payload#jitPayId      |                                 |
   |expected:header#status|200                              |
   |store                 |response-co                      |

* add carrier

* add user

* queues bind "company, carrier, user, identity-claim"

@@@@@@ @ @@@@@   @@@@  @@@@@    @@@@@@ @    @ @@@@@@ @    @ @@@@@
@      @ @    @ @        @      @      @    @ @      @@   @   @
@@@@@  @ @    @  @@@@    @      @@@@@  @    @ @@@@@  @ @  @   @
@      @ @@@@@       @   @      @      @    @ @      @  @ @   @
@      @ @   @  @    @   @      @       @  @  @      @   @@   @
@      @ @    @  @@@@    @      @@@@@@   @@   @@@@@@ @    @   @

* RabbitMQ publish

   |action                         |value                              |
   |-------------------------------|-----------------------------------|
   |description                    |Send onboarding event manually     |
   |exchange                       |fleet_event_bus                    |
   |routing                        |OnBoardingFleetEvent               |
   |wait:after:sec                 |2                                  |
   |payload                        |<file:event-portal-onboarding.json>|
   |payload#Taker.companyId        |${store:response-co.id}            |
   |payload#Taker.UserDetail.userId|${store:response-user.id}          |

* queues check "company, carrier, user, identity-claim"

* Data manage, continue

   |action                 |value                              |
   |-----------------------|-----------------------------------|
   |in                     |${store:event-company}             |
   |description            |EventType of Company must be CREATE|
   |group                  |Check Queues                       |
   |expected#eventType     |CREATE                             |
   |expected#carriers[0].id|${store:response-ca.id}            |

* Data manage, continue

   |action            |value                              |
   |------------------|-----------------------------------|
   |in                |${store:event-carrier}             |
   |description       |EventType of Carrier must be CREATE|
   |group             |Check Queues                       |
   |expected#eventType|CREATE                             |
   |expected#id       |${store:response-ca.id}            |

* Data manage, continue

   |action               |value                                             |
   |---------------------|--------------------------------------------------|
   |in                   |${store:event-identity-claim}                     |
   |description          |Claim Update must contain the correct subsidiaryId|
   |group                |Check Queues                                      |
   |expected#SubsidiaryId|${store:response-ca.id}                           |
   |expected#Email       |${store:response-user.email}                      |

 @@@@  @@@@@@  @@@@   @@@@  @    @ @@@@@     @@@@@@ @    @ @@@@@@ @    @ @@@@@
@      @      @    @ @    @ @@   @ @    @    @      @    @ @      @@   @   @
 @@@@  @@@@@  @      @    @ @ @  @ @    @    @@@@@  @    @ @@@@@  @ @  @   @
     @ @      @      @    @ @  @ @ @    @    @      @    @ @      @  @ @   @
@    @ @      @    @ @    @ @   @@ @    @    @       @  @  @      @   @@   @
 @@@@  @@@@@@  @@@@   @@@@  @    @ @@@@@     @@@@@@   @@   @@@@@@ @    @   @

* RabbitMQ publish

   |action                         |value                                      |
   |-------------------------------|-------------------------------------------|
   |description                    |Send onboarding event manually, second time|
   |                               |with changed customerId                    |
   |exchange                       |fleet_event_bus                            |
   |routing                        |OnBoardingFleetEvent                       |
   |wait:after:sec                 |2                                          |
   |payload                        |<file:event-portal-onboarding.json>        |
   |payload#Taker.companyId        |${store:response-co.id}                    |
   |payload#Taker.UserDetail.userId|${store:response-user.id}                  |
   |payload#Taker.subsidiaryId     |${generate:uuid}                           |

* queues check "company, carrier, user, identity-claim"

* Data manage, continue

   |action                 |value                                               |
   |-----------------------|----------------------------------------------------|
   |in                     |${store:event-company}                              |
   |description            |EventType of Company must be UPDATE for second event|
   |group                  |Check Queues                                        |
   |expected#eventType     |UPDATE                                              |
   |expected#carriers[0].id|${store:response-ca.id}                             |

* Data manage, continue

   |action            |value                                                   |
   |------------------|--------------------------------------------------------|
   |in                |${store:event-carrier}                                  |
   |description       |EventType of Carrier must be UPDATE for the second event|
   |group             |Check Queues                                            |
   |expected#eventType|UPDATE                                                  |
   |expected#id       |${store:response-ca.id}                                 |

* Data manage, continue

   |action               |value                                             |
   |---------------------|--------------------------------------------------|
   |in                   |${store:event-identity-claim}                     |
   |description          |Claim Update must contain the correct subsidiaryId|
   |group                |Check Queues                                      |
   |expected#SubsidiaryId|${store:response-ca.id}                           |
   |expected#Email       |${store:response-user.email}                      |
