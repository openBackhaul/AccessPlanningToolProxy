Delete this link at the end of the specification process:  
- [Roadmap to Specification](../../issues/2)

# AutomatedLinkAcceptanceProxy

### Location
The AutomatedLinkAcceptanceProxy belongs to the NetworkApplications.

### Description
_Copy from Roadmap:_  

The ALAP microservice acts as a proxy between the MicrowaveDeviceInventory and the external tool APT (in which the acceptance logic is implemented). 

The acceptance-relevant data is retrieved from the MWDI and passed on to APT, for the configuration of new or updated microwave links to be verified against their planned configurations and the assigned frequency. This is also frequently repeated to verify the overall compliance and correct configuration of all links. 


### Relevance
The AutomatedLinkAcceptanceProxy fulfils a quality assurance task on the live network.

### Resources
- [Specification](./spec/)
- [TestSuite](./testing/)
- [Implementation](./server/)

### Comments
This application will be specified during [training for ApplicationOwners](https://gist.github.com/openBackhaul/5aabdbc90257b83b9fe7fc4da059d3cd).
