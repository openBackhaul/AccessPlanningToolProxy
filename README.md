# AutomatedLinkAcceptanceProxy

### Location
The AutomatedLinkAcceptanceProxy belongs to the NetworkApplications.

### Description
The ALAP microservice acts as a proxy between the MicrowaveDeviceInventory and the external tool APT (in which the acceptance logic is implemented).

The acceptance-relevant data is collected on demand when APT is calling the /v1/provide-acceptance-data-of-link-endpoint service.  
The data is retrieved from the MicrowaveDeviceInventory and passed on to APT.  
Configuration and hardware inventory information is read from cache.  
Status and alarm information is retrieved from live.  
(An existing logic in APT is verifying the updated microwave links against their planned configurations and the assigned frequency.)

The pre-defined set of attributes is provided in a simplified, almost linear structure, but without any translation.

### Relevance
The AutomatedLinkAcceptanceProxy fulfils a quality assurance task on the live network.

### Dependencies
 [MicroWaveDeviceInventory](https://github.com/openBackhaul/MicroWaveDeviceInventory)

### Resources
- [Specification](./spec/)
- [TestSuite](./testing/)
- [Implementation](./server/)

### Comments
This application got specified during training for ApplicationOwners.
