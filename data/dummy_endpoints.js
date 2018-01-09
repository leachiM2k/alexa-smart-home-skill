module.exports = [
      {
          'endpointId': 'endpoint-001',
          'manufacturerName': 'leachiM2k Raspberry',
          'friendlyName': 'Sessel',
          'description': '001',
          'displayCategories': ['LIGHT'],
          'capabilities': [
              {
                  'type': 'AlexaInterface',
                  'interface': 'Alexa',
                  'version': '3'
              },
              {
                  'type': 'AlexaInterface',
                  'interface': 'Alexa.PowerController',
                  'version': '3',
                  'properties': {
                      'supported': [
                          {
                              'name': 'powerState'
                          }
                      ],
                  }
              }
          ]
      },
      {
          'endpointId': 'endpoint-002',
          'manufacturerName': 'leachiM2k Raspberry',
          'friendlyName': 'Esszimmer',
          'description': '002',
          'displayCategories': ['LIGHT'],
          'capabilities': [
              {
                  'type': 'AlexaInterface',
                  'interface': 'Alexa',
                  'version': '3'
              },
              {
                  'type': 'AlexaInterface',
                  'interface': 'Alexa.PowerController',
                  'version': '3',
                  'properties': {
                      'supported': [
                          {
                              'name': 'powerState'
                          }
                      ],
                  }
              }
          ]
      },
      {
          'endpointId': 'endpoint-003',
          'manufacturerName': 'leachiM2k Raspberry',
          'friendlyName': 'Wohnzimmer',
          'description': '003',
          'displayCategories': ['LIGHT'],
          'capabilities': [
              {
                  'type': 'AlexaInterface',
                  'interface': 'Alexa',
                  'version': '3'
              },
              {
                  'type': 'AlexaInterface',
                  'interface': 'Alexa.PowerController',
                  'version': '3',
                  'properties': {
                      'supported': [
                          {
                              'name': 'powerState'
                          }
                      ],
                  }
              }
          ]
      },
]
