# 1. Sync Backends User

tags: env-all, sb-11, sb-11-3, masterdata-sync

## 1.1. Add a User

tags: sb-11-3.1

* Test description

   |action     |value                     |
   |-----------|--------------------------|
   |description|Add a user to a carrier   |
   |           |* User must exist in Fleet|
   |           |* User must exist in Fuel |
   |priority   |high                      |

* request admin bearer

* add company and carrier, cascaded

* queues bind "fleet-error, user"

* add user

* queues check "fleet-error, user"

* check db backend sync, company: "${store:response-co}", carrier: "${store:response-ca}", user: "${store:response-user}", driver: "", vehicle: ""

## 1.2. Add a User, without Phonenumbers

tags: sb-11-3.2

* Test description

   |action     |value                     |
   |-----------|--------------------------|
   |description|Add a user to a carrier   |
   |           |* User must exist in Fleet|
   |           |* User must exist in Fuel |
   |priority   |high                      |

* add company and carrier, cascaded

* queues bind "fleet-error, user"

* Rest call

   |action                |value                   |
   |----------------------|------------------------|
   |method:post           |/api/user               |
   |description           |Add an User             |
   |payload               |<file:request-user.json>|
   |payload#phoneNumbers  |undefined               |
   |expected:header#status|200                     |
   |store                 |response-user           |

* queues check "fleet-error, user"

* check db backend sync, company: "${store:response-co}", carrier: "${store:response-ca}", user: "${store:response-user}", driver: "", vehicle: ""

## 1.3. Add a User, cascaded (company, carrier, user)

tags: sb-11-3.3

* Test description

   |action     |value                                                      |
   |-----------|-----------------------------------------------------------|
   |description|Add a user to a carrier  (cascaded, company->carrier->user)|
   |           |* User must exist in Fleet                                 |
   |           |* User must exist in Fuel                                  |
   |priority   |high                                                       |

* request admin bearer

* queues bind "fleet-error, commpany, carrier, user"

* Rest call

   |action                       |value                                                      |
   |-----------------------------|-----------------------------------------------------------|
   |method:post                  |/api/company                                               |
   |payload                      |<file:request-company.json>                                |
   |payload#carriers[0]          |<file:request-carrier.json>                                |
   |payload#carriers[0].companyId|undefined                                                  |
   |payload#carriers[0].users[0] |<file:request-user.json>                                   |
   |description                  |Create a cascaded Company request (including Carrier, User)|
   |expected:header#status       |200                                                        |
   |store                        |response-co                                                |
   |store#carriers[0]            |response-ca                                                |
   |store#carriers[0].users[0]   |response-user                                              |

* queues check "fleet-error, commpany, carrier, user"

* check db backend sync, company: "${store:response-co}", carrier: "${store:response-ca}", user: "${store:response-user}", driver: "", vehicle: ""

## 1.4. Add a User, cascaded (carrier, user)

tags: sb-11-3.3

* Test description

   |action     |value                            |
   |-----------|---------------------------------|
   |description|Add a user to a carrier, cascaded|
   |           |* User must exist in Fleet       |
   |           |* User must exist in Fuel        |
   |priority   |high                             |

* add company

* queues bind "fleet-error, carrier, user"

* Rest call

   |action                |value                                             |
   |----------------------|--------------------------------------------------|
   |method:post           |/api/carrier                                      |
   |payload#              |<file:request-carrier.json>                       |
   |payload#users[0]      |<file:request-user.json>                          |
   |description           |Create a cascaded Carrier request (including User)|
   |expected:header#status|200                                               |
   |store#                |response-ca                                       |
   |store#users[0]        |response-user                                     |

* queues check "fleet-error, carrier, user"

* check db backend sync, company: "${store:response-co}", carrier: "${store:response-ca}", user: "${store:response-user}", driver: "", vehicle: ""

## 1.5. Update an User

tags: sb-11-3.5

* Test description

   |action     |value                       |
   |-----------|----------------------------|
   |description|Update a user of a carrier  |
   |           |* User must updated in Fleet|
   |           |* User must updated in Fuel |
   |priority   |high                        |

* request admin bearer

* add company and carrier, cascaded

* add user

* queues bind "fleet-error, user"

* Rest call

   |action                |value                               |
   |----------------------|------------------------------------|
   |method:put            |/api/user/${store:response-user.id} |
   |description           |Update an User                      |
   |payload               |${store:response-user}              |
   |payload#username      |${context:payload.username}-updated |
   |payload#lastname      |${context:payload.lastname}-updated |
   |payload#firstname     |${context:payload.firstname}-updated|
   |expected:header#status|200                                 |
   |store                 |response-user                       |


* queues check "fleet-error, user"

* check db backend sync, company: "${store:response-co}", carrier: "${store:response-ca}", user: "${store:response-user}", driver: "", vehicle: ""

## 1.6. Delete an User

tags: sb-11-3.6

* Test description

   |action     |value                          |
   |-----------|-------------------------------|
   |description|Delete a user                  |
   |           |* User must be deleted in Fleet|
   |           |* User must be deleted in Fuel |
   |priority   |high                           |

* request admin bearer

* add company and carrier, cascaded

* add user

* queues bind "fleet-error, user"

* Rest call

   |action                |value                              |
   |----------------------|-----------------------------------|
   |method:delete         |/api/user/${store:response-user.id}|
   |description           |Delete a User                      |
   |expected:header#status|204                                |

* queues check "fleet-error, user"

* check db backend sync, company: "${store:response-co}", carrier: "${store:response-ca}", user: "${store:response-user}", driver: "", vehicle: ""
