# 1. ContactPerson - MasterData

tags: env-all, master-data, masterdata, md-21, contact-person, v2

## 1.1. Add a Contact Person (without Address and without PhoneNumbers)

tags: md-21.1

* Test description

   |action     |value                                      |
   |-----------|-------------------------------------------|
   |description|Add a new Contact Person without an address|
   |priority   |high                                       |

* request admin bearer

* Rest call

   |action                |value                                                                |
   |----------------------|---------------------------------------------------------------------|
   |method:post           |/api/v2/contactPerson                                                |
   |description           |Creates a ContactPerson without an associated Address and Phonenumber|
   |payload#type          |type1                                                                |
   |payload#email         |email                                                                |
   |payload#lastName      |last                                                                 |
   |payload#firstName     |first                                                                |
   |payload#languageCode  |DK                                                                   |
   |expected:header#status|200                                                                  |
   |store#id              |contactPersonId                                                      |

* Rest call

   |action                |value                                         |
   |----------------------|----------------------------------------------|
   |method:get            |/api/v2/contactPerson/${store:contactPersonId}|
   |description           |Read the previosly created contact person     |
   |expected:header#status|200                                           |
   |expected#type         |type1                                         |
   |expected#email        |email                                         |
   |expected#lastName     |last                                          |
   |expected#firstName    |first                                         |
   |expected#addresses    |[]                                            |
   |expected#phoneNumbers |[]                                            |
   |expected#languageCode |DK                                            |

## 1.2. Add a Contact Person (with Address and without PhoneNumbers)

tags: md-21.2, v2

* Test description

   |action     |value                                                         |
   |-----------|--------------------------------------------------------------|
   |description|Add a new Contact Person with an address, but no phone numbers|
   |priority   |high                                                          |

* request admin bearer

* Rest call

   |action                |value                                |
   |----------------------|-------------------------------------|
   |method:post           |/api/v2/address                      |
   |description           |Creates an Address with random values|
   |payload#type          |${generate:char:30}                  |
   |payload#street        |${generate:fake:address:street}      |
   |payload#city          |${generate:fake:address:city}        |
   |payload#zipCode       |${generate:random:10}                |
   |payload#countryCode   |${generate:fake:address:countryCode} |
   |payload#addition      |${generate:char:100}                 |
   |expected:header#status|200                                  |
   |store#id              |addressId                            |

* Rest call

   |action                |value                                                                |
   |----------------------|---------------------------------------------------------------------|
   |method:post           |/api/v2/contactPerson                                                |
   |description           |Creates a ContactPerson with an associated Address and no Phonenumber|
   |payload#type          |type1                                                                |
   |payload#email         |email                                                                |
   |payload#lastName      |last                                                                 |
   |payload#firstName     |first                                                                |
   |payload#languageCode  |DK                                                                   |
   |payload#addresses[0]  |${store:addressId}                                                   |
   |expected:header#status|200                                                                  |
   |store#id              |contactPersonId                                                      |

* Rest call

   |action                |value                                         |
   |----------------------|----------------------------------------------|
   |method:get            |/api/v2/contactPerson/${store:contactPersonId}|
   |description           |Read the previosly created contact person     |
   |expected:header#status|200                                           |
   |expected#type         |type1                                         |
   |expected#email        |email                                         |
   |expected#lastName     |last                                          |
   |expected#firstName    |first                                         |
   |expected#addresses[0] |${store:addressId}                            |
   |expected#phoneNumbers |[]                                            |
   |expected#languageCode |DK                                            |

## 1.3. Add a Contact Person (with Addresses and PhoneNumbers)

tags: md-21.3

* Test description

   |action     |value                                                           |
   |-----------|----------------------------------------------------------------|
   |description|Add a new Contact Person with an address and with a phone number|
   |priority   |high                                                            |

* request admin bearer

* Rest call

   |action                                  |value                                                                |
   |----------------------------------------|---------------------------------------------------------------------|
   |method:post                             |/api/v2/contactPerson                                                |
   |description                             |Creates a ContactPerson with an associated Address and no Phonenumber|
   |payload#type                            |type1                                                                |
   |payload#email                           |email                                                                |
   |payload#lastName                        |last                                                                 |
   |payload#firstName                       |first                                                                |
   |payload#languageCode                    |DK                                                                   |
   |payload#phoneNumbers[0].number          |1743284130                                                           |
   |payload#phoneNumbers[0].countryPhoneCode|49                                                                   |
   |expected:header#status                  |200                                                                  |
   |store#id                                |contactPersonId                                                      |

* Rest call

   |action                                   |value                                         |
   |-----------------------------------------|----------------------------------------------|
   |method:get                               |/api/v2/contactPerson/${store:contactPersonId}|
   |description                              |Read the previosly created contact person     |
   |expected:header#status                   |200                                           |
   |expected#type                            |type1                                         |
   |expected#email                           |email                                         |
   |expected#lastName                        |last                                          |
   |expected#firstName                       |first                                         |
   |expected#addresses                       |[]                                            |
   |expected:count#phoneNumbers              |1                                             |
   |expected#phoneNumbers[0].number          |1743284130                                    |
   |expected#phoneNumbers[0].countryPhoneCode|49                                            |
   |expected#languageCode                    |DK                                            |

## 1.4. Add a Contact Person with wrong PhoneNumber must throw a correct error

tags: md-21.4

* Test description

   |action     |value                                                                               |
   |-----------|------------------------------------------------------------------------------------|
   |description|Add a new Contact Person with a wrong defined PhoneNumber must occur a correct error|
   |priority   |high                                                                                |

* request admin bearer

* Rest call

   |action                                  |value                                                                |
   |----------------------------------------|---------------------------------------------------------------------|
   |method:post                             |/api/v2/contactPerson                                                |
   |description                             |Creates a ContactPerson with an associated Address and no Phonenumber|
   |payload#type                            |type1                                                                |
   |payload#email                           |email                                                                |
   |payload#lastName                        |last                                                                 |
   |payload#firstName                       |first                                                                |
   |payload#languageCode                    |DK                                                                   |
   |payload#phoneNumbers[0].number          |1743284130                                                           |
   |payload#phoneNumbers[0].countryPhoneCode|DE                                                                   |
   |expected:header#status                  |406                                                                  |
   |expected#status                         |406                                                                  |
   |expected:startsWith#detail              |{phoneNumbers[0].countryPhoneCode=only european (Zones 3–4)          |

## 1.5. Find a Contact Person by searching

tags: md-21.5

* Test description

   |action     |value                                               |
   |-----------|----------------------------------------------------|
   |description|Checks if a Contact Person can be found by searching|
   |priority   |high                                                |

* request admin bearer

* Rest call

   |action                |value                                     |
   |----------------------|------------------------------------------|
   |method:post           |/api/v2/contactPerson                     |
   |description           |Creates a ContactPerson with random values|
   |payload#type          |${generate:char:20}                       |
   |payload#email         |${generate:fake:internet:email}           |
   |payload#lastName      |${generate:fake:name:lastName}            |
   |payload#firstName     |${generate:fake:name:firstName}           |
   |payload#languageCode  |${generate:char:2}                        |
   |expected:header#status|200                                       |
   |store:payload         |contactPersonPayload                      |

<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
<!-- Search by Type -->
<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
* Rest call

   |action                  |value                             |
   |------------------------|----------------------------------|
   |description             |Search contact person by type     |
   |method:get              |/api/v2/contactPerson             |
   |query#searchString      |${store:contactPersonPayload.type}|
   |expected:header#status  |200                               |
   |expected:count#content  |1                                 |
   |expected#content[0].type|${store:contactPersonPayload.type}|

<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
<!-- Search by Email -->
<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
* Rest call

   |action                   |value                              |
   |-------------------------|-----------------------------------|
   |description              |Search contact person by email     |
   |method:get               |/api/v2/contactPerson              |
   |query#searchString       |${store:contactPersonPayload.email}|
   |expected:header#status   |200                                |
   |expected:count#content   |1                                  |
   |expected#content[0].email|${store:contactPersonPayload.email}|

<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
<!-- Search by LastName -->
<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
* Rest call

   |action                      |value                                 |
   |----------------------------|--------------------------------------|
   |description                 |Search contact person by lastName     |
   |method:get                  |/api/v2/contactPerson                 |
   |query#searchString          |${store:contactPersonPayload.lastName}|
   |expected:header#status      |200                                   |
   |expected:count#content      |1                                     |
   |expected#content[0].lastName|${store:contactPersonPayload.lastName}|

<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
<!-- Search by FirstName -->
<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
* Rest call

   |action                       |value                                  |
   |-----------------------------|---------------------------------------|
   |description                  |Search contact person by firstName     |
   |method:get                   |/api/v2/contactPerson                  |
   |query#searchString           |${store:contactPersonPayload.firstName}|
   |expected:header#status       |200                                    |
   |expected:count#content       |1                                      |
   |expected#content[0].firstName|${store:contactPersonPayload.firstName}|

<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
<!-- Search by LanguageCode -->
<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
* Rest call

   |action                          |value                                     |
   |--------------------------------|------------------------------------------|
   |description                     |Search contact person by languageCode     |
   |method:get                      |/api/v2/contactPerson                     |
   |query#searchString              |${store:contactPersonPayload.languageCode}|
   |expected:header#status          |200                                       |
   |expected:greater#content        |0                                         |
   |expected#content[0].languageCode|${store:contactPersonPayload.languageCode}|

## 1.6. Find a Contact Person by searching with Address

tags: md-21.6

* Test description

   |action     |value                                                                             |
   |-----------|----------------------------------------------------------------------------------|
   |description|Checks if a Contact Person can be found by searching when an address is associated|
   |priority   |high                                                                              |

* request admin bearer

* Rest call

   |action                |value                                             |
   |----------------------|--------------------------------------------------|
   |method:post           |/api/v2/address                                   |
   |description           |Creates an Address with random values             |
   |payload#type          |${generate:char:30}                               |
   |payload#street        |${generate:fake:address:street}                   |
   |payload#city          |${generate:fake:address:city}-${generate:random:8}|
   |payload#zipCode       |${generate:random:10}                             |
   |payload#countryCode   |${generate:fake:address:countryCode}              |
   |payload#addition      |${generate:char:100}                              |
   |expected:header#status|200                                               |
   |store:payload         |addressPayload                                    |
   |store#id              |addressId                                         |

* Rest call

   |action                |value                                     |
   |----------------------|------------------------------------------|
   |method:post           |/api/v2/contactPerson                     |
   |description           |Creates a ContactPerson with random values|
   |payload#type          |${generate:char:20}                       |
   |payload#email         |${generate:fake:internet:email}           |
   |payload#lastName      |${generate:fake:name:lastName}            |
   |payload#firstName     |${generate:fake:name:firstName}           |
   |payload#languageCode  |${generate:char:2}                        |
   |payload#addresses[0]  |${store:addressId}                        |
   |expected:header#status|200                                       |
   |store:payload         |contactPersonPayload                      |

<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
<!-- Search by City -->
<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
* Rest call

   |action                  |value                                |
   |------------------------|-------------------------------------|
   |description             |Search contact person by address city|
   |method:get              |/api/v2/contactPerson                |
   |query#searchString      |${store:addressPayload.city}         |
   |expected:header#status  |200                                  |
   |expected:greater#content|0                                    |

<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
<!-- Search by ZipCode -->
<!-- * * * * * * * * * * * * * * * * * * * * * * *  -->
* Rest call

   |action                  |value                                   |
   |------------------------|----------------------------------------|
   |description             |Search contact person by address zipCode|
   |method:get              |/api/v2/contactPerson                   |
   |query#searchString      |${store:addressPayload.zipCode}         |
   |expected:header#status  |200                                     |
   |expected:greater#content|0                                       |

## 1.7. Update an existing Contact Person

tags: md-21.7

* Test description

   |action     |value                                    |
   |-----------|-----------------------------------------|
   |description|Checks if a Contact Person can be updated|
   |priority   |high                                     |

* request admin bearer

* Rest call

   |action                |value                                             |
   |----------------------|--------------------------------------------------|
   |method:post           |/api/v2/address                                   |
   |description           |Creates an Address with random values             |
   |payload#type          |${generate:char:30}                               |
   |payload#street        |${generate:fake:address:street}                   |
   |payload#city          |${generate:fake:address:city}-${generate:random:8}|
   |payload#zipCode       |${generate:random:10}                             |
   |payload#countryCode   |${generate:fake:address:countryCode}              |
   |payload#addition      |${generate:char:100}                              |
   |expected:header#status|200                                               |
   |store:payload         |addressPayload                                    |
   |store#id              |addressId                                         |

* Rest call

   |action                |value                                     |
   |----------------------|------------------------------------------|
   |method:post           |/api/v2/contactPerson                     |
   |description           |Creates a ContactPerson with random values|
   |payload#type          |${generate:char:20}                       |
   |payload#email         |${generate:fake:internet:email}           |
   |payload#lastName      |${generate:fake:name:lastName}            |
   |payload#firstName     |${generate:fake:name:firstName}           |
   |payload#languageCode  |${generate:char:2}                        |
   |payload#addresses[0]  |${store:addressId}                        |
   |expected:header#status|200                                       |
   |store:payload         |contactPersonPayload                      |
   |store#id              |contactPersonId                           |

* Rest call

   |action                |value                                         |
   |----------------------|----------------------------------------------|
   |method:put            |/api/v2/contactPerson/${store:contactPersonId}|
   |description           |Update the ContactPerson                      |
   |payload#type          |typeA                                         |
   |payload#email         |emailA                                        |
   |payload#lastName      |lastNameA                                     |
   |payload#firstName     |firstNameA                                    |
   |payload#languageCode  |AA                                            |
   |payload#addresses[0]  |${store:addressId}                            |
   |payload#phoneNumbers  |null                                          |
   |expected:header#status|200                                           |

* Rest call

   |action                     |value                                         |
   |---------------------------|----------------------------------------------|
   |method:get                 |/api/v2/contactPerson/${store:contactPersonId}|
   |description                |Read the previosly created contact person     |
   |expected:header#status     |200                                           |
   |expected#type              |typeA                                         |
   |expected#email             |emailA                                        |
   |expected#lastName          |lastNameA                                     |
   |expected#firstName         |firstNameA                                    |
   |expected:count#addresses   |1                                             |
   |expected#addresses[0]      |${store:addressId}                            |
   |expected:count#phoneNumbers|0                                             |
   |expected#languageCode      |AA                                            |


## 1.8. Update Contact Person with Address not defined for update

tags: md-21.8


* Test description

   |action     |value                                                                                        |
   |-----------|---------------------------------------------------------------------------------------------|
   |description|Update a Contact Person. Contains an Address, but for updating Address is not defined or null|
   |           |Address must kept                                                                            |
   |priority   |high                                                                                         |

* request admin bearer

* Rest call

   |action                |value                                             |
   |----------------------|--------------------------------------------------|
   |method:post           |/api/v2/address                                   |
   |description           |Creates an Address with random values             |
   |payload#type          |${generate:char:30}                               |
   |payload#street        |${generate:fake:address:street}                   |
   |payload#city          |${generate:fake:address:city}-${generate:random:8}|
   |payload#zipCode       |${generate:random:10}                             |
   |payload#countryCode   |${generate:fake:address:countryCode}              |
   |payload#addition      |${generate:char:100}                              |
   |expected:header#status|200                                               |
   |store:payload         |addressPayload                                    |
   |store#id              |addressId                                         |

* Rest call

   |action                |value                                     |
   |----------------------|------------------------------------------|
   |method:post           |/api/v2/contactPerson                     |
   |description           |Creates a ContactPerson with random values|
   |payload#type          |${generate:char:20}                       |
   |payload#email         |${generate:fake:internet:email}           |
   |payload#lastName      |${generate:fake:name:lastName}            |
   |payload#firstName     |${generate:fake:name:firstName}           |
   |payload#languageCode  |${generate:char:2}                        |
   |payload#addresses[0]  |${store:addressId}                        |
   |expected:header#status|200                                       |
   |store:payload         |contactPersonPayload                      |
   |store#id              |contactPersonId                           |

* Rest call

   |action                |value                                         |
   |----------------------|----------------------------------------------|
   |method:put            |/api/v2/contactPerson/${store:contactPersonId}|
   |description           |Update the ContactPerson                      |
   |                      |Keeps Address empty                           |
   |payload#type          |typeA                                         |
   |payload#email         |emailA                                        |
   |payload#lastName      |lastNameA                                     |
   |payload#firstName     |firstNameA                                    |
   |payload#languageCode  |AA                                            |
   |payload#phoneNumbers  |null                                          |
   |expected:header#status|200                                           |

* Rest call

   |action                     |value                                         |
   |---------------------------|----------------------------------------------|
   |method:get                 |/api/v2/contactPerson/${store:contactPersonId}|
   |description                |Read the previosly created contact person     |
   |expected:header#status     |200                                           |
   |expected#type              |typeA                                         |
   |expected#email             |emailA                                        |
   |expected#lastName          |lastNameA                                     |
   |expected#firstName         |firstNameA                                    |
   |expected:count#addresses   |1                                             |
   |expected#addresses[0]      |${store:addressId}                            |
   |expected:count#phoneNumbers|0                                             |
   |expected#languageCode      |AA                                            |

## 1.9. Update Contact Person with empty Address list

tags: md-21.9


* Test description

   |action     |value                                                                                          |
   |-----------|-----------------------------------------------------------------------------------------------|
   |description|Update a Contact Person. Contains an Address, but for updating Address empty list is used -> []|
   |           |Addresses must be removed                                                                      |
   |priority   |high                                                                                           |

* request admin bearer

* Rest call

   |action                |value                                             |
   |----------------------|--------------------------------------------------|
   |method:post           |/api/v2/address                                   |
   |description           |Creates an Address with random values             |
   |payload#type          |${generate:char:30}                               |
   |payload#street        |${generate:fake:address:street}                   |
   |payload#city          |${generate:fake:address:city}-${generate:random:8}|
   |payload#zipCode       |${generate:random:10}                             |
   |payload#countryCode   |${generate:fake:address:countryCode}              |
   |payload#addition      |${generate:char:100}                              |
   |expected:header#status|200                                               |
   |store:payload         |addressPayload                                    |
   |store#id              |addressId                                         |

* Rest call

   |action                |value                                     |
   |----------------------|------------------------------------------|
   |method:post           |/api/v2/contactPerson                     |
   |description           |Creates a ContactPerson with random values|
   |payload#type          |${generate:char:20}                       |
   |payload#email         |${generate:fake:internet:email}           |
   |payload#lastName      |${generate:fake:name:lastName}            |
   |payload#firstName     |${generate:fake:name:firstName}           |
   |payload#languageCode  |${generate:char:2}                        |
   |payload#addresses[0]  |${store:addressId}                        |
   |expected:header#status|200                                       |
   |store:payload         |contactPersonPayload                      |
   |store#id              |contactPersonId                           |

* Rest call

   |action                |value                                         |
   |----------------------|----------------------------------------------|
   |method:put            |/api/v2/contactPerson/${store:contactPersonId}|
   |description           |Update the ContactPerson                      |
   |                      |Addresses must be removed                     |
   |payload#type          |typeA                                         |
   |payload#email         |emailA                                        |
   |payload#lastName      |lastNameA                                     |
   |payload#firstName     |firstNameA                                    |
   |payload#languageCode  |AA                                            |
   |payload#phoneNumbers  |null                                          |
   |payload#addresses     |[]                                            |
   |expected:header#status|200                                           |

* Rest call

   |action                     |value                                         |
   |---------------------------|----------------------------------------------|
   |method:get                 |/api/v2/contactPerson/${store:contactPersonId}|
   |description                |Read the previosly created contact person     |
   |expected:header#status     |200                                           |
   |expected#type              |typeA                                         |
   |expected#email             |emailA                                        |
   |expected#lastName          |lastNameA                                     |
   |expected#firstName         |firstNameA                                    |
   |expected:count#addresses   |0                                             |
   |expected:count#phoneNumbers|0                                             |
   |expected#languageCode      |AA                                            |

## 1.10. Delete Contact Person

tags: md-21.10


* Test description

   |action     |value                                                                                               |
   |-----------|----------------------------------------------------------------------------------------------------|
   |description|Delete a contact person. Contact Person has associated addresses. Address must remain after deleting|
   |priority   |high                                                                                                |

* request admin bearer

* add contact person with address

* Rest call

   |action                |value                                        |
   |----------------------|---------------------------------------------|
   |method:delete         |/api/v2/contactPerson/${store:response-cp#id}|
   |description           |Delete the ContactPerson                     |
   |                      |Addresses must remain                        |
   |expected:header#status|204                                          |

* Rest call

   |action                |value                                        |
   |----------------------|---------------------------------------------|
   |method:get            |/api/v2/contactPerson/${store:response-cp#id}|
   |description           |Contact Person must be deleted               |
   |expected:header#status|404                                          |

* Rest call

   |action                |value                                  |
   |----------------------|---------------------------------------|
   |method:get            |/api/v2/address/${store:response-ad#id}|
   |description           |Address must remain                    |
   |expected:header#status|200                                    |

## 1.11. Add a Address to a Contact Person

tags: md-21.11


* Test description

   |action     |value                               |
   |-----------|------------------------------------|
   |description|Adds an Address to an Contact Person|
   |priority   |high                                |

* request admin bearer

* Rest call

   |action                |value                                             |
   |----------------------|--------------------------------------------------|
   |method:post           |/api/v2/address                                   |
   |description           |Creates an Address with random values             |
   |payload#type          |${generate:char:30}                               |
   |payload#street        |${generate:fake:address:street}                   |
   |payload#city          |${generate:fake:address:city}-${generate:random:8}|
   |payload#zipCode       |${generate:random:10}                             |
   |payload#countryCode   |${generate:fake:address:countryCode}              |
   |payload#addition      |${generate:char:100}                              |
   |expected:header#status|200                                               |
   |store:payload         |addressPayload                                    |
   |store#id              |addressId                                         |

* Rest call

   |action                |value                                     |
   |----------------------|------------------------------------------|
   |method:post           |/api/v2/contactPerson                     |
   |description           |Creates a ContactPerson with random values|
   |payload#type          |${generate:char:20}                       |
   |payload#email         |${generate:fake:internet:email}           |
   |payload#lastName      |${generate:fake:name:lastName}            |
   |payload#firstName     |${generate:fake:name:firstName}           |
   |payload#languageCode  |${generate:char:2}                        |
   |expected:header#status|200                                       |
   |store:payload         |contactPersonPayload                      |
   |store#id              |contactPersonId                           |

* Rest call

   |action                |value                                                                    |
   |----------------------|-------------------------------------------------------------------------|
   |method:put            |/api/v2/contactPerson/${store:contactPersonId}/address/${store:addressId}|
   |description           |Add Address to Contact Person                                            |
   |expected:header#status|200                                                                      |

* Rest call

   |action                  |value                                         |
   |------------------------|----------------------------------------------|
   |method:get              |/api/v2/contactPerson/${store:contactPersonId}|
   |description             |Read contact person with the added address    |
   |expected:header#status  |200                                           |
   |expected:count#addresses|1                                             |

## 1.12. Check notification

tags: md-21.12, event

* Test description

   |action     |value                                 |
   |-----------|--------------------------------------|
   |description|Check notification of a contact person|
   |           |* create                              |
   |           |* update                              |
   |           |* delete                              |
   |priority   |high                                  |

* request admin bearer

* RabbitMQ bind

   |action     |value                                   |
   |-----------|----------------------------------------|
   |exchange   |masterdata                              |
   |queue      |test.md                                 |
   |description|bind masterdata/contactPerson crud event|

 @@@@  @@@@@  @@@@@@   @@   @@@@@ @@@@@@
@    @ @    @ @       @  @    @   @
@      @    @ @@@@@  @    @   @   @@@@@
@      @@@@@  @      @@@@@@   @   @
@    @ @   @  @      @    @   @   @
 @@@@  @    @ @@@@@@ @    @   @   @@@@@@

* add contact person with address

* RabbitMQ consume, continue

   |action                            |value                                     |
   |----------------------------------|------------------------------------------|
   |queue                             |test.md                                   |
   |description                       |CREATE: Contact Person Event must be fired|
   |expected:header#headers.eventClass|ContactPerson                             |
   |expected:header#headers.eventType |CREATE                                    |
   |expected#id                       |${store:response-cp#id}                   |

@    @ @@@@@  @@@@@    @@   @@@@@ @@@@@@
@    @ @    @ @    @  @  @    @   @
@    @ @    @ @    @ @    @   @   @@@@@
@    @ @@@@@  @    @ @@@@@@   @   @
@    @ @      @    @ @    @   @   @
 @@@@  @      @@@@@  @    @   @   @@@@@@

* Rest call

   |action                |value                                        |
   |----------------------|---------------------------------------------|
   |method:put            |/api/v2/contactPerson/${store:response-cp#id}|
   |description           |UPDATE: Change Contact Person                |
   |payload               |${store:response-cp}                         |
   |expected:header#status|200                                          |

* RabbitMQ consume, continue

   |action                            |value                                     |
   |----------------------------------|------------------------------------------|
   |queue                             |test.md                                   |
   |description                       |UPDATE: Contact Person Event must be fired|
   |expected:header#headers.eventClass|ContactPerson                             |
   |expected:header#headers.eventType |UPDATE                                    |
   |expected#id                       |${store:response-cp#id}                   |

@@@@@  @@@@@@ @      @@@@@@ @@@@@ @@@@@@
@    @ @      @      @        @   @
@    @ @@@@@  @      @@@@@    @   @@@@@
@    @ @      @      @        @   @
@    @ @      @      @        @   @
@@@@@  @@@@@@ @@@@@@ @@@@@@   @   @@@@@@

* Rest call

   |action                |value                                        |
   |----------------------|---------------------------------------------|
   |method:delete         |/api/v2/contactPerson/${store:response-cp#id}|
   |description           |DELETE: delete Contact Person again          |
   |expected:header#status|204                                          |

* RabbitMQ consume, continue

   |action                            |value                                     |
   |----------------------------------|------------------------------------------|
   |queue                             |test.md                                   |
   |description                       |DELETE: Contact Person Event must be fired|
   |expected:header#headers.eventClass|ContactPerson                             |
   |expected:header#headers.eventType |DELETE                                    |
   |expected#id                       |${store:response-cp#id}                   |


## 1.13. Id must not be defined

tags: md-21.13

* Test description

   |action     |value                                                    |
   |-----------|---------------------------------------------------------|
   |description|When creating a Contact Person the id must not be defined|
   |priority   |high                                                     |

* request admin bearer

* Rest call

   |action                |value                                          |
   |----------------------|-----------------------------------------------|
   |method:post           |/api/v2/contactPerson                          |
   |description           |Creates a ContactPerson without a predefined id|
   |payload#type          |${generate:char:20}                            |
   |payload#email         |${generate:fake:internet:email}                |
   |payload#lastName      |${generate:fake:name:lastName}                 |
   |payload#firstName     |${generate:fake:name:firstName}                |
   |payload#languageCode  |${generate:char:2}                             |
   |expected:header#status|200                                            |
   |store#id              |contactPersonId                                |

* Rest call

   |action                |value                                         |
   |----------------------|----------------------------------------------|
   |method:get            |/api/v2/contactPerson/${store:contactPersonId}|
   |description           |Read contact person with the predefined id    |
   |expected:header#status|200                                           |

## 1.14. Id must able to predefined

tags: md-21.14

* Test description

   |action     |value                                                          |
   |-----------|---------------------------------------------------------------|
   |description|When creating a Contact Person the id must be able to predefine|
   |priority   |high                                                           |

* request admin bearer

* Rest call

   |action                |value                                       |
   |----------------------|--------------------------------------------|
   |method:post           |/api/v2/contactPerson                       |
   |description           |Creates a ContactPerson with a predefined id|
   |payload#id            |${generate:uuid}                            |
   |payload#type          |${generate:char:20}                         |
   |payload#email         |${generate:fake:internet:email}             |
   |payload#lastName      |${generate:fake:name:lastName}              |
   |payload#firstName     |${generate:fake:name:firstName}             |
   |payload#languageCode  |${generate:char:2}                          |
   |expected:header#status|200                                         |
   |store:payload         |contactPersonPayload                        |

* Rest call

   |action                |value                                                 |
   |----------------------|------------------------------------------------------|
   |method:get            |/api/v2/contactPerson/${store:contactPersonPayload#id}|
   |description           |Read contact person with the predefined id            |
   |expected:header#status|200                                                   |

## 1.15. Check Events

tags: md-21.15, event

* Test description

   |action     |value                            |
   |-----------|---------------------------------|
   |description|Check events for a contact person|
   |           |* create                         |
   |           |* update                         |
   |           |* delete                         |
   |priority   |high                             |

* RabbitMQ bind

   |action     |value                                   |
   |-----------|----------------------------------------|
   |exchange   |masterdata                              |
   |queue      |test.md                                 |
   |description|Bind masterdata/contactPerson crud event|

* Data manage

   |action         |value                          |
   |---------------|-------------------------------|
   |in#id          |${generate:uuid}               |
   |in#type        |${generate:char:20}            |
   |in#email       |${generate:fake:internet:email}|
   |in#lastName    |${generate:fake:name:lastName} |
   |in#firstName   |${generate:fake:name:firstName}|
   |in#languageCode|${generate:char:2}             |
   |store          |payload-cp                     |

* request admin bearer

 @@@@  @@@@@  @@@@@@   @@   @@@@@ @@@@@@
@    @ @    @ @       @  @    @   @
@      @    @ @@@@@  @    @   @   @@@@@
@      @@@@@  @      @@@@@@   @   @
@    @ @   @  @      @    @   @   @
 @@@@  @    @ @@@@@@ @    @   @   @@@@@@

* RabbitMQ publish

   |action           |value                                   |
   |-----------------|----------------------------------------|
   |description      |CREATE: Publish onboarding event manualy|
   |group            |Check Queues (CREATE)                   |
   |exchange         |masterdata.update                       |
   |routing          |contactPerson                           |
   |payload          |${store:payload-cp}                     |
   |header#eventClass|ContactPerson                           |
   |header#eventType |Create                                  |

* RabbitMQ consume, continue

   |action                            |value                                     |
   |----------------------------------|------------------------------------------|
   |queue                             |test.md                                   |
   |description                       |CREATE: Contact Person Event must be fired|
   |group                             |Check Queues (CREATE)                     |
   |expected:header#headers.eventClass|ContactPerson                             |
   |expected:header#headers.eventType |CREATE                                    |

* Rest call

   |action                |value                                       |
   |----------------------|--------------------------------------------|
   |method:get            |/api/v2/contactPerson/${store:payload-cp#id}|
   |description           |CREATE: Read the Contact Person             |
   |group                 |Check Queues (CREATE)                       |
   |expected:header#status|200                                         |

@    @ @@@@@  @@@@@    @@   @@@@@ @@@@@@
@    @ @    @ @    @  @  @    @   @
@    @ @    @ @    @ @    @   @   @@@@@
@    @ @@@@@  @    @ @@@@@@   @   @
@    @ @      @    @ @    @   @   @
 @@@@  @      @@@@@  @    @   @   @@@@@@

* RabbitMQ publish

   |action           |value                                            |
   |-----------------|-------------------------------------------------|
   |description      |UPDATE: Publish onboarding updated event manualy |
   |group            |Check Queues (UPDATE)                            |
   |exchange         |masterdata.update                                |
   |routing          |contactPerson                                    |
   |payload          |${store:payload-cp}                              |
   |payload#lastName |${store:lastName:=${generate:fake:name:lastName}}|
   |header#eventClass|ContactPerson                                    |
   |header#eventType |Update                                           |

* RabbitMQ consume, continue

   |action                            |value                                     |
   |----------------------------------|------------------------------------------|
   |queue                             |test.md                                   |
   |description                       |UPDATE: Contact Person Event must be fired|
   |group                             |Check Queues (UPDATE)                     |
   |expected:header#headers.eventClass|ContactPerson                             |
   |expected:header#headers.eventType |UPDATE                                    |
   |expected#lastName                 |${store:lastName}                         |

* Rest call

   |action                |value                                       |
   |----------------------|--------------------------------------------|
   |method:get            |/api/v2/contactPerson/${store:payload-cp#id}|
   |description           |UPDATE: Read the Contact Person             |
   |group                 |Check Queues (UPDATE)                       |
   |expected:header#status|200                                         |
   |expected#lastName     |${store:lastName}                           |

@@@@@  @@@@@@ @      @@@@@@ @@@@@ @@@@@@
@    @ @      @      @        @   @
@    @ @@@@@  @      @@@@@    @   @@@@@
@    @ @      @      @        @   @
@    @ @      @      @        @   @
@@@@@  @@@@@@ @@@@@@ @@@@@@   @   @@@@@@

* RabbitMQ publish

   |action           |value                                           |
   |-----------------|------------------------------------------------|
   |description      |DELETE: Publish onboarding updated event manualy|
   |group            |Check Queues (DELETE)                           |
   |exchange         |masterdata.update                               |
   |routing          |contactPerson                                   |
   |payload#id       |${store:payload-cp#id}                          |
   |header#eventClass|ContactPerson                                   |
   |header#eventType |Delete                                          |

* RabbitMQ consume, continue

   |action                            |value                                     |
   |----------------------------------|------------------------------------------|
   |queue                             |test.md                                   |
   |description                       |DELETE: Contact Person Event must be fired|
   |group                             |Check Queues (DELETE)                     |
   |expected:header#headers.eventClass|ContactPerson                             |
   |expected:header#headers.eventType |DELETE                                    |
   |expected#id                       |${store:payload-cp#id}                    |

* Rest call

   |action                |value                                                      |
   |----------------------|-----------------------------------------------------------|
   |method:get            |/api/v2/contactPerson/${store:payload-cp#id}               |
   |description           |DELETE: Read the Contact Person, but it must be deleted now|
   |group                 |Check Queues (DELETE)                                      |
   |expected:header#status|404                                                        |

## 1.16. Check Event Consuming Error

tags: md-21.16, event

* Test description

   |action     |value                                             |
   |-----------|--------------------------------------------------|
   |description|Errors must be processed by the death letter queue|
   |priority   |high                                              |

* RabbitMQ bind

   |action     |value                             |
   |-----------|----------------------------------|
   |exchange   |masterdata.error                  |
   |queue      |test.md.error                     |
   |description|Bind masterdata death letter queue|

* RabbitMQ publish

   |action           |value                                                      |
   |-----------------|-----------------------------------------------------------|
   |description      |Publish deletion without idonboarding updated event manualy|
   |exchange         |masterdata.update                                          |
   |routing          |contactPerson                                              |
   |payload#-id-     |xxxxx                                                      |
   |header#eventClass|ContactPerson                                              |
   |header#eventType |Delete                                                     |

* RabbitMQ consume, continue

   |action       |value                           |
   |-------------|--------------------------------|
   |queue        |test.md.error                   |
   |description  |Death letter Event must be fired|
   |expected#-id-|xxxxx                           |


