# 1. Onboarding Fleet

tags: env-all, onboarding, ob-10

## 1.1. Register a new Company

tags: ob-10.1

* Test description

   |action     |value                 |
   |-----------|----------------------|
   |description|Register a new Company|
   |           |and.....              |
   |priority   |high                  |

* queues bind "company, company-consumer, company-onboarding, fleet-event-bus, error"

* onboarding - register

* onboarding - change password "${store:response-register.companyId}", username: "${store:response-register.email}", password: "${store:response-register.password}", new-password: "${env:default_password}"

* onboarding - request user bearer, username: "${store:response-register.email}", password: "${env:default_password}"

* onboarding - update company

* queues check "fleet-event-bus, company-consumer, company, company-onboarding, error"

* onboarding - update bank

* queues check "company, company-onboarding"

* onboarding - update representative

* onboarding - accept contract and condition

* onboarding - start video legimitation

* queues check "company-consumer, company-onboarding, fleet-event-bus, error"

## 1.2. Id's must match after onboarding

tags: ob-10.2

* Test description

   |action     |value                                                                      |
   |-----------|---------------------------------------------------------------------------|
   |description|After Onboarding ID's must be the same for all backends, including keycloak|
   |priority   |high                                                                       |

* onboarding - complete

## 1.3. Id's must match after onboarding event when debtor already exists (tax - match)

tags: ob-10.3

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

* queues bind "company-consumer, error"

* onboarding - complete

* queues check "company-consumer, error"

