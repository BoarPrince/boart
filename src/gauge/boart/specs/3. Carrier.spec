# 1. Carrier - MasterData

tags: env-all, master-data, user, md-3

## 1.1. Delete a Carrier and check if event payload is correct

tags: md-3.1, delete-event

* Test description

   |action     |value                                                                     |
   |-----------|--------------------------------------------------------------------------|
   |description|Deleting a Carrier                                                        |
   |           |Associated Users must only be deleted                                     |
   |           |Response and Event payload for the users must still contain the CarriersId|
   |priority   |high                                                                      |

* add company and carrier

* add user "first"

* add user "second"

* queues bind "user, carrier"

* Rest call

   |action                |value                                    |
   |----------------------|-----------------------------------------|
   |method:delete         |/api/carrier/${store:response-carrier.id}|
   |description           |Delete the Carrier again                 |
   |expected:header#status|204                                      |

* queues check "user, carrier"

* Data manage

   |action                     |value                                               |
   |---------------------------|----------------------------------------------------|
   |in                         |${store:event-carrier}                              |
   |description                |Carrier event for deleting must contain phonenumbers|
   |group                      |Check Queues                                        |
   |expected#eventType         |DELETE                                              |
   |expected:count#phoneNumbers|1                                                   |

* Data manage

   |action                     |value                                                           |
   |---------------------------|----------------------------------------------------------------|
   |in                         |${store:event-user}                                             |
   |description                |User event for deleting must contain phonenumbers and carrierIds|
   |group                      |Check Queues                                                    |
   |expected#eventType         |DELETE                                                          |
   |expected:count#phoneNumbers|1                                                               |
   |expected:count#carrierIds  |1                                                               |
