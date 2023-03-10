# 1. Co2Componsation - MasterData

tags: co2, env-all, masterdata


## 1.1. Add a compensation

tags: md-7.1

* Test description

   |action     |value                                |
   |-----------|-------------------------------------|
   |description|Adding a co2compensation to a company|
   |priority   |high                                 |

* add company

* Rest call

   |action                |value                  |
   |----------------------|-----------------------|
   |method:post           |/api/co2Compensation   |
   |description           |Add a co2 componsation |
   |payload#companyId     |${store:response-co.id}|
   |payload#value         |1.5                    |
   |expected:header#status|200                    |
   |store                 |response-co2           |

* Rest call

   |action                |value                                        |
   |----------------------|---------------------------------------------|
   |method:get            |/api/co2Compensation/${store:response-co2.id}|
   |description           |Check if co2 can be found                    |
   |expected:header#status|200                                          |
   |expected#value        |1.5                                          |

## 1.2. Update a compensation

tags: md-7.2

* Test description

   |action     |value                     |
   |-----------|--------------------------|
   |description|Updating a co2compensation|
   |priority   |high                      |

* add company

* Rest call

   |action                |value                  |
   |----------------------|-----------------------|
   |method:post           |/api/co2Compensation   |
   |description           |Add a co2 componsation |
   |payload#companyId     |${store:response-co.id}|
   |payload#value         |1.5                    |
   |expected:header#status|200                    |
   |store                 |response-co2           |

* Rest call

   |action                |value                                        |
   |----------------------|---------------------------------------------|
   |method:put            |/api/co2Compensation/${store:response-co2.id}|
   |description           |Update the co2 compensation                  |
   |payload#companyId     |${store:response-co.id}                      |
   |payload#value         |3.55                                         |
   |payload#comment       |problem fixing                               |
   |expected:header#status|200                                          |

* Rest call

   |action                |value                                        |
   |----------------------|---------------------------------------------|
   |method:get            |/api/co2Compensation/${store:response-co2.id}|
   |description           |Check if co2 is updated correctly            |
   |expected:header#status|200                                          |
   |expected#value        |3.55                                         |

## 1.3. Update a compensation (without comment)

tags: md-7.3

* Test description

   |action     |value                                       |
   |-----------|--------------------------------------------|
   |description|Updating a co2compensation without a comment|
   |priority   |high                                        |

* add company

* Rest call

   |action                |value                  |
   |----------------------|-----------------------|
   |method:post           |/api/co2Compensation   |
   |description           |Add a co2 componsation |
   |payload#companyId     |${store:response-co.id}|
   |payload#value         |1.5                    |
   |expected:header#status|200                    |
   |store                 |response-co2           |

* Rest call

   |action                |value                                        |
   |----------------------|---------------------------------------------|
   |method:put            |/api/co2Compensation/${store:response-co2.id}|
   |description           |Update the co2 compensation                  |
   |payload#companyId     |${store:response-co.id}                      |
   |payload#value         |3.55                                         |
   |expected:header#status|400                                          |

## 1.4. Update a compensation (try changing the company)

tags: md-7.4

* Test description

   |action     |value                                                   |
   |-----------|--------------------------------------------------------|
   |description|Updating a co2compensation and try to change the company|
   |priority   |high                                                    |

* add company

* add company, response: "response-second-co"

* Rest call

   |action                |value                  |
   |----------------------|-----------------------|
   |method:post           |/api/co2Compensation   |
   |description           |Add a co2 componsation |
   |payload#companyId     |${store:response-co.id}|
   |payload#value         |1.5                    |
   |expected:header#status|200                    |
   |store                 |response-co2           |

* Rest call

   |action                |value                                           |
   |----------------------|------------------------------------------------|
   |method:put            |/api/co2Compensation/${store:response-co2.id}   |
   |description           |Update the co2 compensation with other companyId|
   |payload#companyId     |${store:response-second-co.id}                  |
   |payload#value         |1.5                                             |
   |payload#comment       |just a try                                      |
   |expected:header#status|200                                             |

* Rest call

   |action                |value                                        |
   |----------------------|---------------------------------------------|
   |method:get            |/api/co2Compensation/${store:response-co2.id}|
   |description           |Check if co2 is updated correctly            |
   |expected:header#status|200                                          |
   |expected#companyId    |${store:response-co.id}                      |

## 1.5. Check co2 value from company

tags: md-7.5

* Test description

   |action     |value                       |
   |-----------|----------------------------|
   |description|check co2 value from company|
   |priority   |high                        |

* add company

* Rest call

   |action                |value                  |
   |----------------------|-----------------------|
   |method:post           |/api/co2Compensation   |
   |description           |Add a co2 componsation |
   |payload#companyId     |${store:response-co.id}|
   |payload#value         |1.5                    |
   |expected:header#status|200                    |

* Rest call

   |action                |value                        |
   |----------------------|-----------------------------|
   |method:post           |/api/co2Compensation         |
   |description           |Add a second co2 componsation|
   |payload#companyId     |${store:response-co.id}      |
   |payload#value         |2.51                         |
   |expected:header#status|200                          |

* Rest call

   |action                  |value                               |
   |------------------------|------------------------------------|
   |method:get              |/api/company/${store:response-co.id}|
   |description             |Check if co2 is correct             |
   |expected:header#status  |200                                 |
   |expected#co2Compensation|4.01                                |

## 1.6. Get co2 history from company

tags: md-7.6

* Test description

   |action     |value                       |
   |-----------|----------------------------|
   |description|get co2 history from company|
   |priority   |high                        |

* add company

* Rest call

   |action                |value                  |
   |----------------------|-----------------------|
   |method:post           |/api/co2Compensation   |
   |description           |Add a co2 componsation |
   |payload#companyId     |${store:response-co.id}|
   |payload#value         |1.5                    |
   |expected:header#status|200                    |

* Rest call

   |action                |value                        |
   |----------------------|-----------------------------|
   |method:post           |/api/co2Compensation         |
   |description           |Add a second co2 componsation|
   |payload#companyId     |${store:response-co.id}      |
   |payload#value         |2.51                         |
   |expected:header#status|200                          |

* Rest call

   |action                |value                       |
   |----------------------|----------------------------|
   |method:post           |/api/co2Compensation        |
   |description           |Add a third co2 componsation|
   |payload#companyId     |${store:response-co.id}     |
   |payload#value         |3.78                        |
   |expected:header#status|200                         |

* Rest call

   |action                |value                                          |
   |----------------------|-----------------------------------------------|
   |method:get            |/api/company/${store:response-co.id}/co2History|
   |description           |Check if co2 history is correct                |
   |expected:header#status|200                                            |
   |expected:count        |3                                              |
