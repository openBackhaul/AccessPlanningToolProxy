# AccessPlanningToolProxy

### Location
The AccessPlanningToolProxy belongs to the NetworkApplications.

### Description
The APTP microservice acts as a proxy between the MicrowaveDeviceInventory and the external Access Planning Tool (APT).

Data from the MWDI is provided on demand to the AccessPlanningTool when it calls any of the services offered by APTP. Configuration and hardware inventory information are read from cache, while status and alarm information are retrieved from live. 
The pre-defined sets of attributes are provided in a simplified, almost linear structure, but without any translation.

APTP offers:

* Delivery of Acceptance Data (<i>/v1/provide-acceptance-data-of-link-endpoint</i>)

  Data is retrieved from the MicrowaveDeviceInventory and passed on to APT in an asynchronous way. No more than one request shall be executed at a time.\
  An existing logic in APT is verifying the updated microwave links against their planned configurations and the assigned frequency.

* Delivery of Historical Performance Data (<i>/v1/provide-historical-pm-data-of-device</i>)

  Data is retrieved from the MicrowaveDeviceInventory and passed on to APT in an asynchronous way. No more than one request shall be executed at a time.  
Returns the relevant historical performance attributes of all the measurements which are more recent than a time-stamp indicated in the request.

* Confirmation of registered SDN-availablity of the device (<i>/v1/check-registered-availability-of-device</i>)

  Indicates whether the requested device appears as connected to the SDN-controller in MWDI.

* Separate delivery of configuration, inventory, alarms, and status information for display at the "Live View" section of APT.
	
* Service for updating the APT client (protocol, address, port, interfaces)



### Relevance
The AccessPlanningToolProxy fulfils a quality assurance task on the live network.

### Dependencies
 [MicroWaveDeviceInventory](https://github.com/openBackhaul/MicroWaveDeviceInventory)

### Resources
- [Specification](./spec/)
- [TestSuite](./testing/)
- [Implementation](./server/)

### Comments
./.
