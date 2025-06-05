# APTP_Receiver_Application

## Description
This application acts as a mirror application to APTP. This application when configured in APTP, is used to receive the data and store in it's temporary memory. The stored data will be retrieved in multiple ways using multiple services. 

### Configuration in APTP
 #### Method 1: Update through service /v1/update-apt-client. 
    - Open swagger user Interface of APTP
    - Go to /v1/update-apt-client service
    - Authorize with the valid username and password
    - Update the ip-address and port values of receiver application in request body
    - Execute the service and confirm if it responds with 204

 #### Method 2: Direct update of tcp-client through OAM layer
    - Open swagger user Interface of APTP
    - Go to OAM layer section
    - First update tcp-client/ipv4-address 
        - provide uuid of APT application in path parameter and actual ip-address of receiver application in request-body.
        - execute the request and confirm it with 204 response code
    - Second update tcp-client/port
        - provide uuid of APT application in path parameter and actual port of receiver application in request-body.
        - execute the request and confirm it with 204 response code

### Testing /v1/provide-acceptance-data-of-link-endpoint
- Trigger /v1/provide-acceptance-data-of-link-endpoint and store request-id for the corresponding request
- Once all the callbacks are completed, APTP is expected to send the data to the service */v1/receive-acceptance-data-of-link-endpoint*
- We can use the request-id to retrieve data from */v1/provide-acceptance-data-of-link-endpoint-for-requestId*

### Testing /v1/provide-historical-pm-data-of-device
- Trigger /v1/provide-historical-pm-data-of-device and store request-id for the corresponding request
- Once all the callbacks are completed, APTP is expected to send the data to the service */v1/receive-historical-pm-data-of-device*
- We can use the request-id to retrieve data from */v1/provide-historical-pm-data-of-device-for-requestId*

### Other services
Apart from obove services which is specific to a request-id, the receiver application has four other generic services which functions as follows:
- */v1/list-all-acceptance-data-of-link-endpoints* - lists all the acceptance data of links of all request-ids
- */v1/list-all-historical-pm-data-of-devices* - lists all the historical data of devices of all request-ids
- */v1/list-request-ids-for-acceptance-data* - lists only request-ids of all requests received so far for acceptance data
- */v1/list-request-ids-for-historical-data* - lists only request-ids of all requests received so far for historical data

Note: All the data is stored in temporary memory of the application and will be cleared off when the application is restarted. 
