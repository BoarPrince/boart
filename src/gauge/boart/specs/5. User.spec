# 1. User - MasterData

tags: env-all, master-data, user, md-5

## 1.1. Add a User

tags: md-5.1

* Test description

   | action      | value                 |
   |-------------|-----------------------|
   | description | Add a user to company |
   | priority    | high                  |

* add company and carrier

* RabbitMQ bind

   | action      | value           |
   |-------------|-----------------|
   | exchange    | user            |
   | queue       | test.md.user    |
   | description | Bind user queue |
   | group       | Bind Queues     |

* Rest call

   | action                 | value                        |
   |------------------------|------------------------------|
   | method:post            | /api/user                    |
   | description            | Add a User with Phonenumbers |
   | payload                | <file:request-user.json>     |
   | expected:header#status | 200                          |

* RabbitMQ consume, continue

   | action                      | value                                 |
   |-----------------------------|---------------------------------------|
   | queue                       | test.md.user                          |
   | group                       | Check Queues                          |
   | description                 | User Event must be fired              |
   |                             | And Phonenumber must also be inlucded |
   | expected:count#phoneNumbers | 1                                     |

## 1.2. Add a User (with cascaded Driver)

tags: md-5.2

* Test description

   | action      | value                                          |
   |-------------|------------------------------------------------|
   | description | Add a User with an cascaded Driver to acompany |
   | priority    | high                                           |

* add company and carrier

* RabbitMQ bind

   | action      | value             |
   |-------------|-------------------|
   | exchange    | driver            |
   | queue       | test.md.driver    |
   | description | Bind driver queue |
   | group       | Bind Queues       |

* RabbitMQ bind

   | action      | value           |
   |-------------|-----------------|
   | exchange    | user            |
   | queue       | test.md.user    |
   | description | Bind user queue |
   | group       | Bind Queues     |

* Rest call

   | action                 | value                                    |
   |------------------------|------------------------------------------|
   | method:post            | /api/user                                |
   | description            | Add a User (including a cascaded Driver) |
   | payload                | <file:request-user.json>                 |
   | payload#driver         | <file:request-driver-only.json>               |
   | expected:header#status | 200                                      |

* RabbitMQ consume, continue

   | action      | value                      |
   |-------------|----------------------------|
   | queue       | test.md.driver             |
   | group       | Check Queues               |
   | description | Driver Event must be fired |

* RabbitMQ consume, continue

   | action      | value                    |
   |-------------|--------------------------|
   | queue       | test.md.user             |
   | group       | Check Queues             |
   | description | User Event must be fired |

## 1.3. Add an User and check validation

tags: md-5.3

* Test description

   | action      | value                                    |
   |-------------|------------------------------------------|
   | description | Adding an User without a local must fail |
   | priority    | high                                     |

* add company and carrier

* Rest call, continue

   | action                 | value                                             |
   |------------------------|---------------------------------------------------|
   | method:post            | /api/user                                         |
   | description            | Add an User without local must result in an error |
   | payload                | <file:request-user.json>                          |
   | payload#locale         | null                                              |
   | expected:header#status | 400                                               |
   | expected#description   | {locale=must not be null},                        |

* Rest call, continue

   | action                 | value                                                |
   |------------------------|------------------------------------------------------|
   | method:post            | /api/user                                            |
   | description            | Add an User with wrong local must result in an error |
   | payload                | <file:request-user.json>                             |
   | payload#locale         | due                                                  |
   | expected:header#status | 400                                                  |
   | expected#description   | {locale=size must be between 2 and 2},               |

* Rest call, continue

   | action                 | value                                                |
   |------------------------|------------------------------------------------------|
   | method:post            | /api/user                                            |
   | description            | Add an User without username must result in an error |
   | payload                | <file:request-user.json>                             |
   | payload#username       | null                                                 |
   | expected:header#status | 400                                                  |

## 1.4. Add and Update an User

tags: md-5.4

* Test description

   | action      | value                                               |
   |-------------|-----------------------------------------------------|
   | description | Adding an User and update the by using the response |
   | priority    | high                                                |

* add company and carrier

* add user

* Rest call

   | action                 | value                                    |
   |------------------------|------------------------------------------|
   | method:put             | /api/user/${store:response-user.id}      |
   | description            | Update the User                          |
   | payload                | ${store:response-user}                   |
   | payload#lastname       | ${store:response-user.firstname}-Updated |
   | expected:header#status | 200                                      |
   | expected#lastname      | ${store:response-user.firstname}-Updated |

## 1.5. Delete an User and check if event payload is correct

tags: md-5.5, delete-event

* Test description

   | action      | value                                                        |
   |-------------|--------------------------------------------------------------|
   | description | Deleting an User                                             |
   |             | Response and Event payload must still contain the CarriersId |
   | priority    | high                                                         |

* add company and carrier

* queues bind "user"

* add user

* queues check "user"

* Data manage

   | action                    | value                                           |
   |---------------------------|-------------------------------------------------|
   | in                        | ${store:event-user}                             |
   | description               | User event for creation must contain carrierIds |
   | group                     | Check Queues                                    |
   | expected#eventType        | CREATE                                          |
   | expected:count#carrierIds | 1                                               |

* Rest call

   | action                 | value                               |
   |------------------------|-------------------------------------|
   | method:delete          | /api/user/${store:response-user.id} |
   | description            | Delete the User again               |
   | expected:header#status | 204                                 |

* queues check "user"

* Data manage

   | action                    | value                                           |
   |---------------------------|-------------------------------------------------|
   | in                        | ${store:event-user}                             |
   | description               | User event for deleting must contain carrierIds |
   | group                     | Check Queues                                    |
   | expected#eventType        | DELETE                                          |
   | expected:count#carrierIds | 1                                               |
