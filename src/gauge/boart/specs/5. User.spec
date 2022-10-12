# 1. User - MasterData

tags: env-all, master-data, user, md-5

## 1.1. Add a User

tags: md-5.1

* Test description

   |action     |value                |
   |-----------|---------------------|
   |description|Add a user to company|
   |priority   |high                 |

* request admin bearer

* add company, response: "co-response"

* add carrier, companyId: "${store:co-response.id}", response: "ca-response"

* RabbitMQ bind

   |action     |value          |
   |-----------|---------------|
   |exchange   |user           |
   |queue      |test.md.user   |
   |description|Bind user queue|
   |group      |Bind Queues    |

* Rest call

   |action                |value                       |
   |----------------------|----------------------------|
   |method:post           |/api/user                   |
   |description           |Add a User with Phonenumbers|
   |payload               |<file:request-user.json>    |
   |expected:header#status|200                         |

* RabbitMQ consume, continue

   |action                     |value                                |
   |---------------------------|-------------------------------------|
   |queue                      |test.md.user                         |
   |group                      |Check Queues                         |
   |description                |User Event must be fired             |
   |                           |And Phonenumber must also be inlucded|
   |expected:count#phoneNumbers|1                                    |

## 1.1. Add a User (with cascaded Driver)

tags: md-4.1

* Test description

   |action     |value                                         |
   |-----------|----------------------------------------------|
   |description|Add a User with an cascaded Driver to acompany|
   |priority   |high                                          |

* request admin bearer

* add company, response: "co-response"

* add carrier, companyId: "${store:co-response.id}", response: "ca-response"

* RabbitMQ bind

   |action     |value            |
   |-----------|-----------------|
   |exchange   |driver           |
   |queue      |test.md.driver   |
   |description|Bind driver queue|
   |group      |Bind Queues      |

* RabbitMQ bind

   |action     |value          |
   |-----------|---------------|
   |exchange   |user           |
   |queue      |test.md.user   |
   |description|Bind user queue|
   |group      |Bind Queues    |

* Rest call

   |action                |value                                   |
   |----------------------|----------------------------------------|
   |method:post           |/api/user                               |
   |description           |Add a User (including a cascaded Driver)|
   |payload               |<file:request-user.json>                |
   |payload#driver        |<file:request-driver.json>              |
   |expected:header#status|200                                     |

* RabbitMQ consume, continue

   |action     |value                     |
   |-----------|--------------------------|
   |queue      |test.md.driver            |
   |group      |Check Queues              |
   |description|Driver Event must be fired|

* RabbitMQ consume, continue

   |action     |value                   |
   |-----------|------------------------|
   |queue      |test.md.user            |
   |group      |Check Queues            |
   |description|User Event must be fired|

## 1.2.Add an User and check validation

tags: md-4.2

* Test description

   |action     |value                                   |
   |-----------|----------------------------------------|
   |description|Adding an User without a local must fail|
   |priority   |high                                    |

* request admin bearer

* add company, response: "co-response"

* add carrier, companyId: "${store:co-response.id}", response: "ca-response"

* Rest call, continue

   |action                |value                                            |
   |----------------------|-------------------------------------------------|
   |method:post           |/api/user                                        |
   |description           |Add an User without local must result in an error|
   |payload               |<file:request-user.json>                         |
   |payload#locale        |null                                             |
   |expected:header#status|400                                              |
   |expected#description  |{locale=must not be null},                       |

* Rest call, continue

   |action                |value                                               |
   |----------------------|----------------------------------------------------|
   |method:post           |/api/user                                           |
   |description           |Add an User with wrong local must result in an error|
   |payload               |<file:request-user.json>                            |
   |payload#locale        |due                                                 |
   |expected:header#status|400                                                 |
   |expected#description  |{locale=size must be between 2 and 2},              |

* Rest call, continue

   |action                |value                                               |
   |----------------------|----------------------------------------------------|
   |method:post           |/api/user                                           |
   |description           |Add an User without username must result in an error|
   |payload               |<file:request-user.json>                            |
   |payload#username      |null                                                |
   |expected:header#status|400                                                 |

## 1.2.Add and Update an User

tags: md-4.3

* Test description

   |action     |value                                              |
   |-----------|---------------------------------------------------|
   |description|Adding an User and update the by using the response|
   |priority   |high                                               |

* request admin bearer

* add company, response: "co-response"

* add carrier, companyId: "${store:co-response.id}", response: "ca-response"

* Rest call

   |action                |value                     |
   |----------------------|--------------------------|
   |method:post           |/api/user                 |
   |description           |Add an User               |
   |payload               |<file:request-user.json>  |
   |expected:header#status|200                       |
   |--expected#description|{locale=must not be null},|
   |store                 |userResponse              |

* Rest call

   |action                |value                                  |
   |----------------------|---------------------------------------|
   |method:put            |/api/user/${store:userResponse.id}     |
   |description           |Update the User                        |
   |payload               |${store:userResponse}                  |
   |payload#lastname      |${store:userResponse.firstname}-Updated|
   |expected:header#status|200                                    |
   |expected#lastname     |${store:userResponse.firstname}-Updated|
