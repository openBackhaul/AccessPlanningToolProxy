const ProfileCollection = require('onf-core-model-ap/applicationPattern/onfModel/models/ProfileCollection');

exports.getStringProfileInstanceValue = async function(expectedStringName) {
    let stringValue = "";
    try {
      let stringProfileName = "string-profile-1-0:PROFILE_NAME_TYPE_STRING_PROFILE";
      let stringProfileInstanceList = await ProfileCollection.getProfileListForProfileNameAsync(stringProfileName);
  
      for (let i = 0; i < stringProfileInstanceList.length; i++) {
        let stringProfileInstance = stringProfileInstanceList[i];
        let stringProfilePac = stringProfileInstance[onfAttributes.STRING_PROFILE.PAC];
        let stringProfileCapability = stringProfilePac[onfAttributes.STRING_PROFILE.CAPABILITY];
        let stringName = stringProfileCapability[onfAttributes.STRING_PROFILE.STRING_NAME];
        if (stringName == expectedStringName) {
          let stringProfileConfiguration = stringProfilePac[onfAttributes.STRING_PROFILE.CONFIGURATION];
          stringValue = stringProfileConfiguration[onfAttributes.STRING_PROFILE.STRING_VALUE];
          break;
        }
      }
      return stringValue;
  
    } catch (error) {
      console.log(error);
    }
  
  }