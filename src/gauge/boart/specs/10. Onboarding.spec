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
   |method:get                               |/api/company/${store:ob-companyId}                |
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
   |description           |Create a Debtor                  |
   |expected:header#status|201                              |
   |store#taxNumber       |company.taxId                    |
   |store#name            |company.name                     |
   |store#taxNumber       |debtor.taxId                     |
   |store#id              |debtor.id                        |

* queues bind "company-consumer, fleet-error, md-error"

* onboarding - complete

* queues check "company-consumer, fleet-error, md-error"

