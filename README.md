Delete this link at the end of the specification process:  
- [Roadmap to Specification](../../issues/2)

# AutomatedLinkAcceptanceProxy

### Location
The AutomatedLinkAcceptanceProxy belongs to the NetworkApplications.

### Description
The ALAP microservice acts as a proxy between the MicrowaveDeviceInventory and the external tool APT (in which the acceptance logic is implemented).

The acceptance-relevant data is retrieved from the MWDI and passed on to APT, for the configuration and the overall compliance of new or updated microwave links to be verified against their planned configurations and the assigned frequency. 

The acceptance data is collected on demand when the offered service /v1/provide-acceptance-data-of-link-endpoint is called.

Configuration attributes are retrieved from the cache resource paths of the MWDI.  
Status attributes are retrieved from the live resource paths of the MWDI.

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
