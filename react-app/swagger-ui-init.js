
window.onload = function() {
  // Build a system
  var url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  var options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "info": {
      "title": "GpsTracker API Documentation",
      "version": "1.0.0",
      "description": "Comprehensive API documentation for GPS Tracker tracking, device management, and user authentication.",
      "contact": {
        "name": "Developer Support",
        "email": "support@example.com"
      }
    },
    "servers": [
      {
        "url": "http://139.59.1.109:5000",
        "description": "Development server"
      }
    ],
    "components": {
      "securitySchemes": {
        "bearerAuth": {
          "type": "http",
          "scheme": "bearer",
          "bearerFormat": "JWT"
        }
      },
      "schemas": {
        "AppUpdate": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "651f82f80c6be812b1d3ef12"
            },
            "version": {
              "type": "string",
              "example": "1.0.4"
            },
            "releaseDate": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-19T06:00:00.000Z"
            },
            "title": {
              "type": "string",
              "example": "Bug Fixes & UI Enhancements"
            },
            "description": {
              "type": "string",
              "example": "Fixed a critical login layout bug and improved vehicle tracking update intervals."
            },
            "status": {
              "type": "integer",
              "enum": [
                0,
                1
              ],
              "description": "0 = active, 1 = inactive/deleted",
              "example": 0
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-19T06:17:34.000Z"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-19T06:17:34.000Z"
            }
          }
        },
        "AppUpdateResponse": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "651f82f80c6be812b1d3ef12"
            },
            "version": {
              "type": "string",
              "example": "1.0.4"
            },
            "releaseDate": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-19T06:00:00.000Z"
            },
            "releaseDateText": {
              "type": "string",
              "example": "May 19, 2026"
            },
            "title": {
              "type": "string",
              "example": "Bug Fixes & UI Enhancements"
            },
            "description": {
              "type": "string",
              "example": "Fixed a critical login layout bug and improved vehicle tracking update intervals."
            }
          }
        },
        "DataPlan": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "651f82f80c6be812b1d3ef12"
            },
            "planName": {
              "type": "string",
              "example": "Annual Unlimited Tracker"
            },
            "durationMonths": {
              "type": "number",
              "example": 12
            },
            "price": {
              "type": "number",
              "example": 1200
            },
            "originalPrice": {
              "type": "number",
              "example": 1500
            },
            "gstApplicable": {
              "type": "boolean",
              "example": true
            },
            "isSuperCombo": {
              "type": "boolean",
              "example": false
            },
            "tagText": {
              "type": "string",
              "example": "Best Value"
            },
            "savingText": {
              "type": "string",
              "example": "Save ₹300"
            },
            "popularText": {
              "type": "string",
              "example": "Popular"
            },
            "features": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "example": [
                "Real-time Tracking",
                "Geofence Alerts"
              ]
            },
            "sortOrder": {
              "type": "number",
              "example": 1
            },
            "status": {
              "type": "integer",
              "enum": [
                0,
                1
              ],
              "description": "0 = active, 1 = inactive",
              "example": 0
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-19T06:17:34.000Z"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-19T06:17:34.000Z"
            }
          }
        },
        "DataPlanResponse": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "651f82f80c6be812b1d3ef12"
            },
            "planName": {
              "type": "string",
              "example": "Annual Unlimited Tracker"
            },
            "durationMonths": {
              "type": "number",
              "example": 12
            },
            "validityText": {
              "type": "string",
              "example": "12 Months"
            },
            "price": {
              "type": "number",
              "example": 1200
            },
            "originalPrice": {
              "type": "number",
              "example": 1500
            },
            "gstApplicable": {
              "type": "boolean",
              "example": true
            },
            "isSuperCombo": {
              "type": "boolean",
              "example": false
            },
            "tagText": {
              "type": "string",
              "example": "Best Value"
            },
            "savingText": {
              "type": "string",
              "example": "Save ₹300"
            },
            "popularText": {
              "type": "string",
              "example": "Popular"
            },
            "features": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "example": [
                "Real-time Tracking",
                "Geofence Alerts"
              ]
            }
          }
        },
        "VehicleDataPlanResponse": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "651f82f80c6be812b1d4ef34"
            },
            "imei": {
              "type": "string",
              "example": "123456789012345"
            },
            "planId": {
              "type": "string",
              "example": "651f82f80c6be812b1d3ef12"
            },
            "planName": {
              "type": "string",
              "example": "Annual Unlimited Tracker"
            },
            "durationMonths": {
              "type": "number",
              "example": 12
            },
            "currentPlanText": {
              "type": "string",
              "example": "12 months"
            },
            "startDate": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-19T06:17:34.000Z"
            },
            "expiryDate": {
              "type": "string",
              "format": "date-time",
              "example": "2027-05-19T06:17:34.000Z"
            },
            "expiryDateText": {
              "type": "string",
              "example": "19 May 2027"
            },
            "daysLeft": {
              "type": "number",
              "example": 365
            },
            "amountPaid": {
              "type": "number",
              "example": 1200
            },
            "paymentStatus": {
              "type": "string",
              "enum": [
                "pending",
                "paid",
                "failed"
              ],
              "example": "paid"
            }
          }
        },
        "Document": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "651f82f80c6be812b1d3ef12"
            },
            "vehicleId": {
              "type": "string",
              "example": "651f82f80c6be812b1d3ef10"
            },
            "imei": {
              "type": "string",
              "example": "863456041234567"
            },
            "type": {
              "type": "string",
              "example": "vehicle"
            },
            "subtype": {
              "type": "string",
              "example": "insurance"
            },
            "title": {
              "type": "string",
              "example": "HDFC ERGO Vehicle Insurance"
            },
            "expiryDate": {
              "type": "string",
              "format": "date-time",
              "example": "2027-05-20T00:00:00.000Z"
            },
            "billingDate": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-20T00:00:00.000Z"
            },
            "billingAmount": {
              "type": "number",
              "example": 3500.5
            },
            "shopName": {
              "type": "string",
              "example": "Automobile Solutions"
            },
            "shopContact": {
              "type": "string",
              "example": "+919876543210"
            },
            "warrantyExpiry": {
              "type": "string",
              "format": "date-time",
              "example": "2028-05-20T00:00:00.000Z"
            },
            "frontImage": {
              "type": "string",
              "example": "uploads/documents/front-1716182950.jpg"
            },
            "backImage": {
              "type": "string",
              "example": "uploads/documents/back-1716182950.jpg"
            },
            "status": {
              "type": "boolean",
              "example": true
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-20T05:18:30.000Z"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-20T05:18:30.000Z"
            }
          }
        },
        "FeatureCategory": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "651f82f80c6be812b1d3ef12"
            },
            "title": {
              "type": "string",
              "example": "Security & Safety"
            },
            "description": {
              "type": "string",
              "example": "Features designed to secure your vehicle and alert you."
            },
            "bannerImage": {
              "type": "string",
              "example": "uploads/feature-1716182950-123456.jpg"
            },
            "totalFeatures": {
              "type": "integer",
              "example": 5
            },
            "exploredFeatures": {
              "type": "integer",
              "example": 2
            },
            "exploredText": {
              "type": "string",
              "example": "2/5 features completed"
            },
            "sortOrder": {
              "type": "integer",
              "example": 1
            },
            "status": {
              "type": "integer",
              "enum": [
                0,
                1
              ],
              "description": "0 = active, 1 = inactive",
              "example": 0
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-20T07:37:34.000Z"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-20T07:37:34.000Z"
            }
          }
        },
        "FeatureItem": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "651f82f80c6be812b1d3ef15"
            },
            "categoryId": {
              "type": "string",
              "example": "651f82f80c6be812b1d3ef12"
            },
            "title": {
              "type": "string",
              "example": "Geofence Alerts"
            },
            "shortDescription": {
              "type": "string",
              "example": "Get instantly notified when your vehicle enters or exits a predefined boundary."
            },
            "icon": {
              "type": "string",
              "example": "uploads/feature-1716183000-789.png"
            },
            "introTitle": {
              "type": "string",
              "example": "How to use Geofencing"
            },
            "introDescription": {
              "type": "string",
              "example": "1. Tap on Geofence. 2. Draw a circle on the map."
            },
            "introImages": {
              "type": "array",
              "items": {
                "type": "string",
                "example": "uploads/feature-1716183050-999.png"
              }
            },
            "status": {
              "type": "integer",
              "enum": [
                0,
                1
              ],
              "description": "0 = active, 1 = inactive",
              "example": 0
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-20T07:37:34.000Z"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-20T07:37:34.000Z"
            }
          }
        },
        "HealthInsuranceOption": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "651f82f80c6be812b1d3ef12"
            },
            "name": {
              "type": "string",
              "example": "Star Health Insurance"
            },
            "status": {
              "type": "integer",
              "enum": [
                0,
                1
              ],
              "description": "0 = active, 1 = inactive",
              "example": 0
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-20T09:52:30.000Z"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-20T09:52:30.000Z"
            }
          }
        },
        "HealthInsuranceResponse": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "651f82f80c6be812b1d3ef19"
            },
            "user": {
              "type": "object",
              "properties": {
                "_id": {
                  "type": "string",
                  "example": "651f82f80c6be812b1d3ef10"
                },
                "name": {
                  "type": "string",
                  "example": "John Doe"
                },
                "mobile": {
                  "type": "string",
                  "example": "9876543210"
                },
                "email": {
                  "type": "string",
                  "example": "john.doe@example.com"
                }
              }
            },
            "bloodGroup": {
              "type": "string",
              "example": "O+"
            },
            "healthInsurance": {
              "type": "object",
              "properties": {
                "_id": {
                  "type": "string",
                  "example": "651f82f80c6be812b1d3ef12"
                },
                "name": {
                  "type": "string",
                  "example": "Star Health Insurance"
                }
              }
            },
            "healthInsuranceCardNumber": {
              "type": "string",
              "example": "SH-9876-5432-10"
            },
            "policyNumber": {
              "type": "string",
              "example": "POL-09876543"
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-20T09:52:35.000Z"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-20T09:52:35.000Z"
            }
          }
        },
        "CallSlot": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "69da237aed0e5121f459bfbd"
            },
            "slotDate": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-20T00:00:00.000Z"
            },
            "dayText": {
              "type": "string",
              "example": "Wed"
            },
            "startTime": {
              "type": "string",
              "example": "10:00"
            },
            "endTime": {
              "type": "string",
              "example": "11:00"
            },
            "displayTime": {
              "type": "string",
              "example": "10:00 AM - 11:00 AM"
            },
            "isAvailable": {
              "type": "boolean",
              "example": true
            },
            "sortOrder": {
              "type": "integer",
              "example": 0
            },
            "status": {
              "type": "integer",
              "example": 0
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-20T09:00:00.000Z"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-20T09:00:00.000Z"
            }
          }
        },
        "GroupedCallSlots": {
          "type": "object",
          "properties": {
            "date": {
              "type": "string",
              "example": "2026-05-20"
            },
            "dayNumber": {
              "type": "integer",
              "example": 20
            },
            "monthText": {
              "type": "string",
              "example": "May"
            },
            "dayText": {
              "type": "string",
              "example": "Wed"
            },
            "slots": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "_id": {
                    "type": "string",
                    "example": "69da237aed0e5121f459bfbd"
                  },
                  "startTime": {
                    "type": "string",
                    "example": "10:00"
                  },
                  "endTime": {
                    "type": "string",
                    "example": "11:00"
                  },
                  "displayTime": {
                    "type": "string",
                    "example": "10:00 AM - 11:00 AM"
                  },
                  "isAvailable": {
                    "type": "boolean",
                    "example": true
                  }
                }
              }
            }
          }
        },
        "BookedIssueResponse": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "69da237aed0e5121f459bfcf"
            },
            "userId": {
              "type": "string",
              "example": "69d4edbd81a3afcb12e63140"
            },
            "vehicle": {
              "type": "object",
              "properties": {
                "_id": {
                  "type": "string",
                  "example": "69e335210e9583a6bcfe2840"
                },
                "imei": {
                  "type": "string",
                  "example": "860710085959719"
                },
                "vehicleNumber": {
                  "type": "string",
                  "example": "MP096543"
                },
                "vehicleModel": {
                  "type": "string",
                  "example": "Splendor Plus"
                },
                "displayName": {
                  "type": "string",
                  "example": "Splendor Plus MP096543"
                }
              }
            },
            "issueType": {
              "type": "string",
              "example": "report_issue"
            },
            "issueRelatedTo": {
              "type": "string",
              "example": "GPS Tracking Issue"
            },
            "description": {
              "type": "string",
              "example": "Vehicle location is not updating since yesterday."
            },
            "callSlot": {
              "type": "object",
              "properties": {
                "_id": {
                  "type": "string",
                  "example": "69da237aed0e5121f459bfbd"
                },
                "slotDate": {
                  "type": "string",
                  "format": "date-time",
                  "example": "2026-05-20T00:00:00.000Z"
                },
                "dateText": {
                  "type": "string",
                  "example": "20 May 2026"
                },
                "dayText": {
                  "type": "string",
                  "example": "Wed"
                },
                "displayTime": {
                  "type": "string",
                  "example": "10:00 AM - 11:00 AM"
                }
              }
            },
            "issueStatus": {
              "type": "string",
              "example": "scheduled"
            }
          }
        },
        "UserIssueResponse": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "69da237aed0e5121f459bfcf"
            },
            "imei": {
              "type": "string",
              "example": "860710085959719"
            },
            "vehicleNumber": {
              "type": "string",
              "example": "MP096543"
            },
            "issueType": {
              "type": "string",
              "example": "report_issue"
            },
            "issueRelatedTo": {
              "type": "string",
              "example": "GPS Tracking Issue"
            },
            "description": {
              "type": "string",
              "example": "Vehicle location is not updating since yesterday."
            },
            "issueStatus": {
              "type": "string",
              "example": "scheduled"
            },
            "callSlot": {
              "type": "object",
              "nullable": true,
              "properties": {
                "_id": {
                  "type": "string",
                  "example": "69da237aed0e5121f459bfbd"
                },
                "slotDate": {
                  "type": "string",
                  "format": "date-time",
                  "example": "2026-05-20T00:00:00.000Z"
                },
                "dateText": {
                  "type": "string",
                  "example": "20 May 2026"
                },
                "displayTime": {
                  "type": "string",
                  "example": "10:00 AM - 11:00 AM"
                }
              }
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-20T09:00:00.000Z"
            }
          }
        },
        "UserSuggestionResponse": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "69da237aed0e5121f459bfda"
            },
            "userId": {
              "type": "string",
              "example": "69d4edbd81a3afcb12e63140"
            },
            "issueType": {
              "type": "string",
              "example": "suggestion"
            },
            "suggestionType": {
              "type": "string",
              "example": "app_feature"
            },
            "subject": {
              "type": "string",
              "example": "Dark Mode option"
            },
            "description": {
              "type": "string",
              "example": "Please add a toggle to support system dark mode."
            },
            "issueStatus": {
              "type": "string",
              "example": "pending"
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-20T09:30:00.000Z"
            }
          }
        },
        "UserSuggestionItem": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "69da237aed0e5121f459bfda"
            },
            "suggestionType": {
              "type": "string",
              "example": "app_feature"
            },
            "subject": {
              "type": "string",
              "example": "Dark Mode option"
            },
            "description": {
              "type": "string",
              "example": "Please add a toggle to support system dark mode."
            },
            "issueStatus": {
              "type": "string",
              "example": "pending"
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-20T09:30:00.000Z"
            }
          }
        },
        "VehicleControl": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "651f82f80c6be812b1d3ef12"
            },
            "imei": {
              "type": "string",
              "example": "123456789012345"
            },
            "tankCapacity": {
              "type": "number",
              "example": 55
            },
            "vehicleMileage": {
              "type": "number",
              "example": 12.5
            },
            "vehicleLock": {
              "type": "boolean",
              "example": false
            },
            "vehicleIcon": {
              "type": "string",
              "example": "car"
            },
            "vehicleColor": {
              "type": "string",
              "example": "#FF0000"
            },
            "vehicleImage": {
              "type": "string",
              "nullable": true,
              "example": "uploads/vehicleImage-169827393.jpg"
            },
            "status": {
              "type": "string",
              "example": "active"
            },
            "createdAt": {
              "type": "string",
              "format": "date-time"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time"
            }
          }
        },
        "VehicleControlDetailResponse": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "651f82f80c6be812b1d3ef12"
            },
            "imei": {
              "type": "string",
              "example": "123456789012345"
            },
            "tankCapacity": {
              "type": "number",
              "example": 55
            },
            "vehicleMileage": {
              "type": "number",
              "example": 12.5
            },
            "vehicleLock": {
              "type": "boolean",
              "example": false
            },
            "vehicleIcon": {
              "type": "string",
              "example": "car"
            },
            "vehicleColor": {
              "type": "string",
              "example": "#FF0000"
            },
            "vehicleImage": {
              "type": "string",
              "nullable": true,
              "example": "http://localhost:5000/uploads/vehicleImage-169827393.jpg"
            },
            "status": {
              "type": "string",
              "example": "active"
            },
            "createdAt": {
              "type": "string",
              "format": "date-time"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time"
            },
            "vehicleDetails": {
              "type": "object",
              "nullable": true,
              "properties": {
                "vehicleType": {
                  "type": "string",
                  "example": "Sedan"
                },
                "fuelType": {
                  "type": "string",
                  "example": "Petrol"
                },
                "vehicleMaker": {
                  "type": "string",
                  "example": "Toyota"
                },
                "vehicleModel": {
                  "type": "string",
                  "example": "Corolla"
                },
                "vehicleNumber": {
                  "type": "string",
                  "example": "MH12AB1234"
                },
                "imei": {
                  "type": "string",
                  "example": "123456789012345"
                },
                "status": {
                  "type": "string",
                  "example": "active"
                }
              }
            }
          }
        },
        "VehicleRefuel": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "652fab12b1d3ef12b1d3efa1"
            },
            "imei": {
              "type": "string",
              "example": "123456789012345"
            },
            "refuelDate": {
              "type": "string",
              "example": "2026-05-18"
            },
            "refuelTime": {
              "type": "string",
              "example": "14:30"
            },
            "currentOdometer": {
              "type": "number",
              "example": 45200
            },
            "totalAmount": {
              "type": "number",
              "example": 3000
            },
            "pricePerLiter": {
              "type": "number",
              "example": 100
            },
            "tankStatus": {
              "type": "integer",
              "enum": [
                1,
                2
              ],
              "example": 1
            },
            "fuelBeforeRefuel": {
              "type": "number",
              "example": 0
            },
            "totalFuelFilled": {
              "type": "number",
              "example": 30
            },
            "status": {
              "type": "integer",
              "example": 0
            },
            "createdAt": {
              "type": "string",
              "format": "date-time"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time"
            }
          }
        },
        "WarrantyPlan": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "651f82f80c6be812b1d3ef15"
            },
            "planName": {
              "type": "string",
              "example": "1 Year Extended Warranty"
            },
            "durationMonths": {
              "type": "number",
              "example": 12
            },
            "originalPrice": {
              "type": "number",
              "example": 999
            },
            "offerPrice": {
              "type": "number",
              "example": 365
            },
            "discountText": {
              "type": "string",
              "example": "Booster offer @60% OFF"
            },
            "title": {
              "type": "string",
              "example": "Extend warranty of your Ajjas Lite by 1 year @ ₹1/day"
            },
            "subtitle": {
              "type": "string",
              "example": "Secure your vehicle tracking uninterrupted"
            },
            "productName": {
              "type": "string",
              "example": "Ajjas Lite"
            },
            "productImage": {
              "type": "string",
              "example": "uploads/products/ajjas-lite.png"
            },
            "benefits": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "example": [
                "Free Replacement",
                "24/7 Support"
              ]
            },
            "status": {
              "type": "integer",
              "enum": [
                0,
                1
              ],
              "description": "0 = active, 1 = inactive",
              "example": 0
            },
            "createdAt": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-19T06:17:34.000Z"
            },
            "updatedAt": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-19T06:17:34.000Z"
            }
          }
        },
        "VehicleWarrantyResponse": {
          "type": "object",
          "properties": {
            "_id": {
              "type": "string",
              "example": "651f82f80c6be812b1d4ef99"
            },
            "imei": {
              "type": "string",
              "example": "123456789012345"
            },
            "vehicleId": {
              "type": "string",
              "example": "651f82f80c6be812b1d3ef12"
            },
            "planId": {
              "type": "string",
              "example": "651f82f80c6be812b1d3ef15"
            },
            "durationMonths": {
              "type": "number",
              "example": 12
            },
            "startDate": {
              "type": "string",
              "format": "date-time",
              "example": "2026-05-19T06:17:34.000Z"
            },
            "expiryDate": {
              "type": "string",
              "format": "date-time",
              "example": "2027-05-19T06:17:34.000Z"
            },
            "expiryDateText": {
              "type": "string",
              "example": "19 May 2027"
            },
            "daysLeft": {
              "type": "number",
              "example": 365
            },
            "amountPaid": {
              "type": "number",
              "example": 365
            },
            "paymentStatus": {
              "type": "string",
              "enum": [
                "pending",
                "paid",
                "failed"
              ],
              "example": "paid"
            }
          }
        }
      }
    },
    "security": [
      {
        "bearerAuth": []
      }
    ],
    "paths": {
      "/api/app-update/app-updates": {
        "post": {
          "summary": "Create a new app update entry",
          "description": "Registers a new version release of the mobile/desktop application with the specified title and description.",
          "tags": [
            "AppUpdate"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "version",
                    "releaseDate"
                  ],
                  "properties": {
                    "version": {
                      "type": "string",
                      "description": "Version number of the app release",
                      "example": "1.0.4"
                    },
                    "releaseDate": {
                      "type": "string",
                      "format": "date-time",
                      "description": "Date and time of the release",
                      "example": "2026-05-19T06:00:00.000Z"
                    },
                    "title": {
                      "type": "string",
                      "description": "Short title/header summarizing the update",
                      "example": "Bug Fixes & UI Enhancements"
                    },
                    "description": {
                      "type": "string",
                      "description": "Detailed release notes or description of changes in this version",
                      "example": "Fixed a critical login layout bug and improved vehicle tracking update intervals."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "App update created successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "App update created successfully"
                      },
                      "data": {
                        "$ref": "#/components/schemas/AppUpdate"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - Missing required fields (version, releaseDate)",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Version and releaseDate are required"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Something went wrong"
                      },
                      "error": {
                        "type": "string",
                        "example": "Error details"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "get": {
          "summary": "Retrieve active app updates",
          "description": "Returns a list of all active (status = 0) app update entries, sorted by their releaseDate in descending order. Includes a formatted releaseDateText.",
          "tags": [
            "AppUpdate"
          ],
          "responses": {
            "200": {
              "description": "App updates retrieved successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "App updates fetched successfully"
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/AppUpdateResponse"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Something went wrong"
                      },
                      "error": {
                        "type": "string",
                        "example": "Error details"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/auth/register": {
        "post": {
          "summary": "Register a new user",
          "description": "Creates a new user account with profile image upload.",
          "tags": [
            "Auth"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "username": {
                      "type": "string",
                      "example": "johndoe"
                    },
                    "email": {
                      "type": "string",
                      "example": "john@example.com"
                    },
                    "password": {
                      "type": "string",
                      "example": "Password123!"
                    },
                    "userProfile": {
                      "type": "string",
                      "format": "binary",
                      "description": "Profile picture file"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "User registered successfully"
            },
            "400": {
              "description": "Incomplete data or duplicate email"
            }
          }
        }
      },
      "/api/auth/user-detail/{userId}": {
        "put": {
          "summary": "Update user details",
          "description": "Updates profile details of an existing user by their ID.",
          "tags": [
            "Auth"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "userId",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "The unique ID of the user to update.",
              "example": "60d0fe4f5311236168a109ca"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "example": "John"
                    },
                    "middleName": {
                      "type": "string",
                      "example": "Robert"
                    },
                    "lastName": {
                      "type": "string",
                      "example": "Doe"
                    },
                    "mobile_number": {
                      "type": "string",
                      "example": "1234567890"
                    },
                    "email": {
                      "type": "string",
                      "example": "john.doe@example.com"
                    },
                    "dateOfBirth": {
                      "type": "string",
                      "format": "date",
                      "example": "1995-12-15"
                    },
                    "country": {
                      "type": "string",
                      "example": "USA"
                    },
                    "state": {
                      "type": "string",
                      "example": "California"
                    },
                    "city": {
                      "type": "string",
                      "example": "Los Angeles"
                    },
                    "address": {
                      "type": "string",
                      "example": "123 Main St"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "User details updated successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "User detail updated successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "_id": {
                            "type": "string",
                            "example": "60d0fe4f5311236168a109ca"
                          },
                          "name": {
                            "type": "string",
                            "example": "John"
                          },
                          "middleName": {
                            "type": "string",
                            "example": "Robert"
                          },
                          "lastName": {
                            "type": "string",
                            "example": "Doe"
                          },
                          "fullName": {
                            "type": "string",
                            "example": "John Robert Doe"
                          },
                          "email": {
                            "type": "string",
                            "example": "john.doe@example.com"
                          },
                          "mobile_number": {
                            "type": "string",
                            "example": "1234567890"
                          },
                          "dateOfBirth": {
                            "type": "string",
                            "format": "date-time",
                            "example": "1995-12-15T00:00:00.000Z"
                          },
                          "country": {
                            "type": "string",
                            "example": "USA"
                          },
                          "state": {
                            "type": "string",
                            "example": "California"
                          },
                          "city": {
                            "type": "string",
                            "example": "Los Angeles"
                          },
                          "address": {
                            "type": "string",
                            "example": "123 Main St"
                          },
                          "userProfile": {
                            "type": "string",
                            "example": "uploads/1234567890-profile.jpg"
                          },
                          "role": {
                            "type": "string",
                            "example": "customer"
                          },
                          "createdAt": {
                            "type": "string",
                            "format": "date-time",
                            "example": "2026-05-21T06:00:00.000Z"
                          },
                          "updatedAt": {
                            "type": "string",
                            "format": "date-time",
                            "example": "2026-05-21T06:05:00.000Z"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "userId is required or invalid input"
            },
            "404": {
              "description": "User not found"
            },
            "409": {
              "description": "Email already exists"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/auth/login": {
        "post": {
          "summary": "Login user",
          "description": "Authenticate user and return a JWT token.",
          "tags": [
            "Auth"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "email": {
                      "type": "string",
                      "example": "john@example.com"
                    },
                    "password": {
                      "type": "string",
                      "example": "Password123!"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Login success with token"
            },
            "401": {
              "description": "Invalid credentials"
            }
          }
        }
      },
      "/api/auth/send-otp": {
        "post": {
          "summary": "Send OTP to email",
          "description": "Sends a verification code to the user's email address for password reset or activation.",
          "tags": [
            "Auth"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "email": {
                      "type": "string",
                      "example": "john@example.com"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "OTP sent successfully"
            },
            "404": {
              "description": "User not found"
            }
          }
        }
      },
      "/api/auth/verify-otp": {
        "post": {
          "summary": "Verify OTP",
          "description": "Validates the one-time password (OTP) sent to the user's email.",
          "tags": [
            "Auth"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "email": {
                      "type": "string",
                      "example": "john@example.com"
                    },
                    "otp": {
                      "type": "string",
                      "example": "123456"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "OTP verified"
            },
            "400": {
              "description": "Invalid or expired OTP"
            }
          }
        }
      },
      "/api/auth/reset-password": {
        "post": {
          "summary": "Reset password",
          "description": "Updates the user's password after successful OTP verification.",
          "tags": [
            "Auth"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "email": {
                      "type": "string",
                      "example": "john@example.com"
                    },
                    "newPassword": {
                      "type": "string",
                      "example": "NewStrongPassword123!"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Password reset successfully"
            }
          }
        }
      },
      "/api/auth/social-login": {
        "post": {
          "summary": "Social Login (Google/etc.)",
          "description": "Authenticate user using an external OAuth token.",
          "tags": [
            "Auth"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "token": {
                      "type": "string",
                      "description": "The OAuth token received from Google/Firebase."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Social Login success"
            }
          }
        }
      },
      "/api/data-plans/recharge-plans": {
        "post": {
          "summary": "Create a new recharge data plan",
          "description": "Creates a new data plan option for vehicles with specific prices, validity, features, and marketing labels.",
          "tags": [
            "DataPlans"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "planName",
                    "durationMonths",
                    "price"
                  ],
                  "properties": {
                    "planName": {
                      "type": "string",
                      "description": "Name of the recharge plan",
                      "example": "Annual Unlimited Tracker"
                    },
                    "durationMonths": {
                      "type": "number",
                      "description": "Duration of the plan in months",
                      "example": 12
                    },
                    "price": {
                      "type": "number",
                      "description": "Selling price of the plan",
                      "example": 1200
                    },
                    "originalPrice": {
                      "type": "number",
                      "description": "Original/strike-through price of the plan (before discount)",
                      "example": 1500
                    },
                    "gstApplicable": {
                      "type": "boolean",
                      "description": "Whether GST is applicable to this plan",
                      "example": true
                    },
                    "isSuperCombo": {
                      "type": "boolean",
                      "description": "Flag indicating if the plan is a combo/premium pack",
                      "example": false
                    },
                    "tagText": {
                      "type": "string",
                      "description": "Highlighting badge text (e.g. Best Value, Recommended)",
                      "example": "Best Value"
                    },
                    "savingText": {
                      "type": "string",
                      "description": "Custom text highlighting savings",
                      "example": "Save ₹300"
                    },
                    "popularText": {
                      "type": "string",
                      "description": "Special text indicator for popularity",
                      "example": "Popular"
                    },
                    "features": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "description": "List of features included in the plan",
                      "example": [
                        "Real-time Tracking",
                        "Geofence Alerts",
                        "Playback History (30 days)"
                      ]
                    },
                    "sortOrder": {
                      "type": "number",
                      "description": "Ordering weight for listing priority",
                      "example": 1
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Recharge plan created successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Recharge plan created successfully"
                      },
                      "data": {
                        "$ref": "#/components/schemas/DataPlan"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - Missing required fields",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "planName, durationMonths and price are required"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Something went wrong"
                      },
                      "error": {
                        "type": "string",
                        "example": "Error details"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "get": {
          "summary": "Get all active recharge data plans",
          "description": "Returns a sorted list of all active recharge plans (status = 0).",
          "tags": [
            "DataPlans"
          ],
          "responses": {
            "200": {
              "description": "Recharge plans fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Recharge plans fetched successfully"
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/DataPlanResponse"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Something went wrong"
                      },
                      "error": {
                        "type": "string",
                        "example": "Error details"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/data-plans/current-data-plan/{imei}": {
        "get": {
          "summary": "Get current active data plan for a vehicle",
          "description": "Fetches the vehicle detail and its currently active, paid data plan based on the provided IMEI number.",
          "tags": [
            "DataPlans"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "imei",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "The IMEI number of the tracker/device",
              "example": "123456789012345"
            }
          ],
          "responses": {
            "200": {
              "description": "Current data plan fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Current data plan fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "vehicle": {
                            "type": "object",
                            "properties": {
                              "_id": {
                                "type": "string",
                                "example": "651f82f80c6be812b1d3ef12"
                              },
                              "userId": {
                                "type": "string",
                                "example": "651f82f80c6be812b1d3ef10"
                              },
                              "imei": {
                                "type": "string",
                                "example": "123456789012345"
                              },
                              "vehicleType": {
                                "type": "string",
                                "example": "Car"
                              },
                              "fuelType": {
                                "type": "string",
                                "example": "Petrol"
                              },
                              "vehicleMaker": {
                                "type": "string",
                                "example": "Honda"
                              },
                              "vehicleModel": {
                                "type": "string",
                                "example": "Civic"
                              },
                              "vehicleNumber": {
                                "type": "string",
                                "example": "MH12AB1234"
                              }
                            }
                          },
                          "currentPlan": {
                            "anyOf": [
                              {
                                "type": "null"
                              },
                              {
                                "$ref": "#/components/schemas/VehicleDataPlanResponse"
                              }
                            ]
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - IMEI is required",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "IMEI is required"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Vehicle not found for this IMEI",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Vehicle not found for this IMEI"
                      },
                      "data": {
                        "type": "null",
                        "example": null
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Something went wrong"
                      },
                      "error": {
                        "type": "string",
                        "example": "Error details"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/data-plans/vehicle-data-plan": {
        "post": {
          "summary": "Assign a data plan to a vehicle",
          "description": "Subscribes a vehicle (identified by IMEI) to a selected recharge plan. Deactivates existing active plan for that vehicle.",
          "tags": [
            "DataPlans"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "imei",
                    "planId"
                  ],
                  "properties": {
                    "imei": {
                      "type": "string",
                      "description": "Device IMEI number",
                      "example": "123456789012345"
                    },
                    "planId": {
                      "type": "string",
                      "description": "The MongoDB ObjectId of the DataPlan",
                      "example": "651f82f80c6be812b1d3ef12"
                    },
                    "paymentStatus": {
                      "type": "string",
                      "enum": [
                        "pending",
                        "paid",
                        "failed"
                      ],
                      "description": "Status of the transaction",
                      "example": "paid"
                    },
                    "amountPaid": {
                      "type": "number",
                      "description": "Custom amount paid (defaults to plan price if omitted)",
                      "example": 1200
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Vehicle data plan assigned successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Vehicle data plan assigned successfully"
                      },
                      "data": {
                        "$ref": "#/components/schemas/VehicleDataPlanResponse"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - IMEI and planId are required",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "IMEI and planId are required"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Recharge plan not found",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Recharge plan not found"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Something went wrong"
                      },
                      "error": {
                        "type": "string",
                        "example": "Error details"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/data-plans/recharge-plan-summary/{planId}": {
        "get": {
          "summary": "Get recharge plan checkout and billing summary",
          "description": "Generates a complete billing summary for the selected plan including tax (GST), discounts, and final payable amount.",
          "tags": [
            "DataPlans"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "planId",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "The MongoDB ObjectId of the DataPlan",
              "example": "651f82f80c6be812b1d3ef12"
            }
          ],
          "responses": {
            "200": {
              "description": "Recharge plan summary fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Recharge plan summary fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "selectedPlan": {
                            "type": "object",
                            "properties": {
                              "_id": {
                                "type": "string",
                                "example": "651f82f80c6be812b1d3ef12"
                              },
                              "planName": {
                                "type": "string",
                                "example": "Annual Unlimited Tracker"
                              },
                              "durationMonths": {
                                "type": "number",
                                "example": 12
                              },
                              "validityText": {
                                "type": "string",
                                "example": "12 Months"
                              },
                              "price": {
                                "type": "number",
                                "example": 1200
                              },
                              "originalPrice": {
                                "type": "number",
                                "example": 1500
                              },
                              "features": {
                                "type": "array",
                                "items": {
                                  "type": "string"
                                },
                                "example": [
                                  "Real-time Tracking",
                                  "Geofence Alerts"
                                ]
                              },
                              "suggestionText": {
                                "type": "string",
                                "example": "Best choice for personal cars"
                              }
                            }
                          },
                          "billSummary": {
                            "type": "object",
                            "properties": {
                              "planPrice": {
                                "type": "number",
                                "example": 1200
                              },
                              "discount": {
                                "type": "number",
                                "example": 0
                              },
                              "total": {
                                "type": "number",
                                "example": 1200
                              },
                              "gstPercentage": {
                                "type": "number",
                                "example": 18
                              },
                              "gstAmount": {
                                "type": "number",
                                "example": 216
                              },
                              "payableAmount": {
                                "type": "number",
                                "example": 1416
                              }
                            }
                          },
                          "buttonText": {
                            "type": "string",
                            "example": "Pay ₹1416"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - Plan ID is required",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Plan ID is required"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Recharge plan not found",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Recharge plan not found"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Something went wrong"
                      },
                      "error": {
                        "type": "string",
                        "example": "Error details"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/assign-devices": {
        "post": {
          "summary": "Assign devices to a user and vehicle",
          "description": "Assigns one or more IMEI devices to a user and vehicle. Checks if the vehicle already has devices assigned and if any IMEI is already in use.",
          "tags": [
            "Device Assignment"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "userId",
                    "vehicleId",
                    "imei"
                  ],
                  "properties": {
                    "userId": {
                      "type": "string",
                      "description": "User ID to assign devices to",
                      "example": "6626f1a2b3c4d5e6f7890123"
                    },
                    "vehicleId": {
                      "type": "string",
                      "description": "Vehicle ID to associate devices with",
                      "example": "6626f1a2b3c4d5e6f7890456"
                    },
                    "imei": {
                      "type": "string",
                      "description": "IMEI of the device to assign",
                      "example": "123456789012345"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Devices assigned successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Devices assigned successfully"
                      },
                      "assignedCount": {
                        "type": "integer",
                        "example": 2
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object"
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Validation error - missing fields, vehicle already assigned, or duplicate IMEI",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "This vehicle already has devices assigned"
                      },
                      "existingImei": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        }
                      },
                      "duplicateImei": {
                        "type": "array",
                        "items": {
                          "type": "string"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Server error"
            }
          }
        }
      },
      "/api/devices/{userId}": {
        "get": {
          "summary": "Get devices assigned to a user",
          "tags": [
            "Device Assignment"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "userId",
              "schema": {
                "type": "string"
              },
              "required": true,
              "description": "User ID"
            }
          ],
          "responses": {
            "200": {
              "description": "List of assigned devices",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Device list fetched successfully"
                      },
                      "count": {
                        "type": "integer"
                      },
                      "devices": {
                        "type": "array",
                        "items": {
                          "type": "object"
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "userId is required"
            },
            "500": {
              "description": "Database error"
            }
          }
        }
      },
      "/api/devicebyvehicle/{vehicleId}": {
        "get": {
          "summary": "Get devices assigned to a vehicle",
          "tags": [
            "Device Assignment"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "vehicleId",
              "schema": {
                "type": "string"
              },
              "required": true,
              "description": "Vehicle ID"
            }
          ],
          "responses": {
            "200": {
              "description": "List of devices assigned to the vehicle",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Device list fetched successfully"
                      },
                      "count": {
                        "type": "integer"
                      },
                      "devices": {
                        "type": "array",
                        "items": {
                          "type": "object"
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "vehicleId is required"
            },
            "500": {
              "description": "Database error"
            }
          }
        }
      },
      "/api/update/device/{id}": {
        "put": {
          "summary": "Update an assigned device record",
          "tags": [
            "Device Assignment"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "schema": {
                "type": "string"
              },
              "required": true,
              "description": "Device assignment record ID"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "user_id_FK": {
                      "type": "string",
                      "description": "Updated user ID"
                    },
                    "vehicleId": {
                      "type": "string",
                      "description": "Updated vehicle ID"
                    },
                    "imei": {
                      "type": "string",
                      "description": "Updated IMEI number"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Device record updated",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Device updated successfully"
                      },
                      "updated": {
                        "type": "object",
                        "properties": {
                          "deviceAssignUpdated": {
                            "type": "integer"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Database error"
            }
          }
        }
      },
      "/api/device/{id}": {
        "delete": {
          "summary": "Delete a device assignment",
          "tags": [
            "Device Assignment"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "schema": {
                "type": "string"
              },
              "required": true,
              "description": "Device record ID to delete"
            }
          ],
          "responses": {
            "200": {
              "description": "Deleted successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Device deleted successfully"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Device not found"
            },
            "500": {
              "description": "Database error"
            }
          }
        }
      },
      "/api/alldevice-list": {
        "get": {
          "summary": "Get list of all assigned devices",
          "tags": [
            "Device Assignment"
          ],
          "responses": {
            "200": {
              "description": "List of all device assignment records",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Device list fetched successfully"
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string"
                            },
                            "imei": {
                              "type": "string"
                            },
                            "vehicleId": {
                              "type": "string"
                            },
                            "user_id_FK": {
                              "type": "string"
                            },
                            "user_name": {
                              "type": "string"
                            },
                            "user_email": {
                              "type": "string"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Database error"
            }
          }
        }
      },
      "/api/deviceListById/{id}": {
        "get": {
          "summary": "Get a specific device assignment record by ID",
          "tags": [
            "Device Assignment"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "schema": {
                "type": "string"
              },
              "required": true,
              "description": "ID of the device assignment"
            }
          ],
          "responses": {
            "200": {
              "description": "Record details",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": {
                        "type": "boolean",
                        "example": true
                      },
                      "device": {
                        "type": "object"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Device not found"
            },
            "500": {
              "description": "Database error"
            }
          }
        }
      },
      "/api/device/device-list": {
        "get": {
          "summary": "Get all devices list",
          "tags": [
            "Device"
          ],
          "responses": {
            "200": {
              "description": "List of devices"
            }
          }
        }
      },
      "/api/device/gps/{imei}": {
        "get": {
          "summary": "Get GPS data by IMEI",
          "tags": [
            "Device"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "imei",
              "schema": {
                "type": "string"
              },
              "required": true,
              "description": "Device IMEI"
            }
          ],
          "responses": {
            "200": {
              "description": "GPS data for the device"
            }
          }
        }
      },
      "/api/device/deviceStatus": {
        "get": {
          "summary": "Get all devices status",
          "tags": [
            "Device"
          ],
          "responses": {
            "200": {
              "description": "Status list"
            }
          }
        }
      },
      "/api/device/check-deviceList_byDate": {
        "post": {
          "summary": "Check device list by date",
          "tags": [
            "Device"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "date": {
                      "type": "string"
                    },
                    "imei": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Data for the specific date"
            }
          }
        }
      },
      "/api/device/gps": {
        "get": {
          "summary": "Get all GPS data",
          "tags": [
            "Device"
          ],
          "responses": {
            "200": {
              "description": "GPS data records"
            }
          }
        }
      },
      "/api/device/device/api/gps": {
        "get": {
          "summary": "Get latest GPS data for all devices",
          "tags": [
            "Device"
          ],
          "responses": {
            "200": {
              "description": "Latest GPS records"
            }
          }
        }
      },
      "/api/documents/document": {
        "post": {
          "summary": "Add a new document with image uploads",
          "description": "Uploads a document (like driving license, RC, insurance, bills) with front and optional back images, linked to a vehicle by its IMEI.",
          "tags": [
            "Documents"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "imei",
                    "type",
                    "subtype",
                    "frontImage"
                  ],
                  "properties": {
                    "imei": {
                      "type": "string",
                      "description": "IMEI of the vehicle associated with this document",
                      "example": "863456041234567"
                    },
                    "type": {
                      "type": "string",
                      "description": "Main category/type of the document (e.g., personal, vehicle, bills)",
                      "example": "vehicle"
                    },
                    "subtype": {
                      "type": "string",
                      "description": "Sub-category/subtype of the document (e.g., driving_license, insurance, vehicle_rc, accessory_bill)",
                      "example": "insurance"
                    },
                    "title": {
                      "type": "string",
                      "description": "Document title or name",
                      "example": "HDFC ERGO Vehicle Insurance"
                    },
                    "expiryDate": {
                      "type": "string",
                      "format": "date",
                      "description": "Expiry date of the document",
                      "example": "2027-05-20"
                    },
                    "billingDate": {
                      "type": "string",
                      "format": "date",
                      "description": "Date of billing/purchase",
                      "example": "2026-05-20"
                    },
                    "billingAmount": {
                      "type": "number",
                      "description": "Total amount billed",
                      "example": 3500.5
                    },
                    "shopName": {
                      "type": "string",
                      "description": "Name of the shop or provider",
                      "example": "Automobile Solutions"
                    },
                    "shopContact": {
                      "type": "string",
                      "description": "Contact details of the shop/provider",
                      "example": "+919876543210"
                    },
                    "warrantyExpiry": {
                      "type": "string",
                      "format": "date",
                      "description": "Warranty expiry date",
                      "example": "2028-05-20"
                    },
                    "frontImage": {
                      "type": "string",
                      "format": "binary",
                      "description": "Front side image of the document (required)"
                    },
                    "backImage": {
                      "type": "string",
                      "format": "binary",
                      "description": "Back side image of the document (optional)"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Document added successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Added successfully"
                      },
                      "data": {
                        "$ref": "#/components/schemas/Document"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - Missing required front image or fields",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Front image required"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Vehicle not found - The provided IMEI does not match any vehicle",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Vehicle not found"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Internal server error details"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/features/feature-categories": {
        "post": {
          "summary": "Create a new feature category",
          "description": "Registers a new category under which individual features can be grouped. Supports uploading a banner image.",
          "tags": [
            "Features"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "title"
                  ],
                  "properties": {
                    "title": {
                      "type": "string",
                      "description": "Title of the feature category",
                      "example": "Security & Safety"
                    },
                    "description": {
                      "type": "string",
                      "description": "Detailed description of the category",
                      "example": "Features designed to secure your vehicle and alerts you in case of any unauthorized activity."
                    },
                    "bannerImage": {
                      "type": "string",
                      "format": "binary",
                      "description": "Banner image file for the category"
                    },
                    "totalFeatures": {
                      "type": "integer",
                      "description": "Total number of features in this category",
                      "example": 5
                    },
                    "exploredFeatures": {
                      "type": "integer",
                      "description": "Number of features explored by the user",
                      "example": 2
                    },
                    "sortOrder": {
                      "type": "integer",
                      "description": "Numeric sort weight/priority",
                      "example": 1
                    },
                    "exploredText": {
                      "type": "string",
                      "description": "Explored features visual textual description",
                      "example": "2 of 5 features configured"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Feature category created successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Feature category created successfully"
                      },
                      "data": {
                        "$ref": "#/components/schemas/FeatureCategory"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - Missing title parameter",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "title is required"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/features/feature-items": {
        "post": {
          "summary": "Create a new feature item",
          "description": "Creates an individual feature option within a specific category. Allows uploading an icon and intro images.",
          "tags": [
            "Features"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "categoryId",
                    "title"
                  ],
                  "properties": {
                    "categoryId": {
                      "type": "string",
                      "description": "MongoDB ObjectID of the parent feature category",
                      "example": "651f82f80c6be812b1d3ef12"
                    },
                    "title": {
                      "type": "string",
                      "description": "Name/title of the feature item",
                      "example": "Geofence Alerts"
                    },
                    "shortDescription": {
                      "type": "string",
                      "description": "Short pitch or description of the feature",
                      "example": "Get instantly notified when your vehicle enters or exits a predefined boundary."
                    },
                    "icon": {
                      "type": "string",
                      "format": "binary",
                      "description": "Icon file representing the feature"
                    },
                    "introImages": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "binary"
                      },
                      "description": "Introductory/walkthrough images (max 10)"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Feature item created successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Feature item created successfully"
                      },
                      "data": {
                        "$ref": "#/components/schemas/FeatureItem"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - Missing categoryId or title",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "categoryId and title are required"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Feature category not found or inactive",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Feature category not found"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/features/discover-features": {
        "get": {
          "summary": "Retrieve active discover features and categories",
          "description": "Returns a sorted list of all active feature categories (status = 0) with computed feature coverage/explored counters.",
          "tags": [
            "Features"
          ],
          "responses": {
            "200": {
              "description": "Discover features fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Discover features fetched successfully"
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "_id": {
                              "type": "string",
                              "example": "651f82f80c6be812b1d3ef12"
                            },
                            "title": {
                              "type": "string",
                              "example": "Security & Safety"
                            },
                            "description": {
                              "type": "string",
                              "example": "Features designed to secure your vehicle..."
                            },
                            "bannerImage": {
                              "type": "string",
                              "format": "uri",
                              "example": "http://139.59.1.109:5000/uploads/feature-1716182950-123456.jpg"
                            },
                            "totalFeatures": {
                              "type": "integer",
                              "example": 5
                            },
                            "exploredFeatures": {
                              "type": "integer",
                              "example": 2
                            },
                            "exploredText": {
                              "type": "string",
                              "example": "2/5 Features explored"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/features/feature-category/{categoryId}": {
        "get": {
          "summary": "Retrieve detailed category info and its features",
          "description": "Returns details of a specific feature category alongside all nested active feature items.",
          "tags": [
            "Features"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "categoryId",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "The ObjectID of the feature category"
            }
          ],
          "responses": {
            "200": {
              "description": "Feature category detail fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Feature category detail fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "category": {
                            "type": "object",
                            "properties": {
                              "_id": {
                                "type": "string",
                                "example": "651f82f80c6be812b1d3ef12"
                              },
                              "title": {
                                "type": "string",
                                "example": "Security & Safety"
                              },
                              "description": {
                                "type": "string",
                                "example": "Features designed to secure..."
                              },
                              "bannerImage": {
                                "type": "string",
                                "format": "uri",
                                "example": "http://139.59.1.109:5000/uploads/feature-1716182950-123456.jpg"
                              }
                            }
                          },
                          "features": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "_id": {
                                  "type": "string",
                                  "example": "651f82f80c6be812b1d3ef15"
                                },
                                "title": {
                                  "type": "string",
                                  "example": "Geofence Alerts"
                                },
                                "shortDescription": {
                                  "type": "string",
                                  "example": "Get instantly notified when your vehicle enters or exits..."
                                },
                                "icon": {
                                  "type": "string",
                                  "format": "uri",
                                  "example": "http://139.59.1.109:5000/uploads/feature-1716183000-789.png"
                                },
                                "redirectKey": {
                                  "type": "string",
                                  "example": "GEOFENCE_SETTING"
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - Missing categoryId",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "categoryId is required"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Feature category not found or inactive",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Feature category not found"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/features/feature-intro/{featureId}": {
        "post": {
          "summary": "Save or update intro details for a feature",
          "description": "Configures introductory screens (walkthrough text and up to 10 screenshots/images) for a feature. Can replace or append images.",
          "tags": [
            "Features"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "featureId",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "The ObjectID of the feature item"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "introTitle": {
                      "type": "string",
                      "description": "Title of the walkthrough intro",
                      "example": "How to use Geofencing"
                    },
                    "introDescription": {
                      "type": "string",
                      "description": "Subtext/walkthrough instructions",
                      "example": "1. Tap on Geofence. 2. Draw a circle on the map. 3. Save boundary."
                    },
                    "replaceImages": {
                      "type": "boolean",
                      "description": "If set to true, existing walkthrough images will be overwritten by the new upload",
                      "example": true
                    },
                    "introImages": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "binary"
                      },
                      "description": "Additional walkthrough screenshot/graphic images (max 10)"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Feature intro saved successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Feature intro saved successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "_id": {
                            "type": "string",
                            "example": "651f82f80c6be812b1d3ef15"
                          },
                          "categoryId": {
                            "type": "string",
                            "example": "651f82f80c6be812b1d3ef12"
                          },
                          "title": {
                            "type": "string",
                            "example": "Geofence Alerts"
                          },
                          "introTitle": {
                            "type": "string",
                            "example": "How to use Geofencing"
                          },
                          "introDescription": {
                            "type": "string",
                            "example": "1. Tap on Geofence. 2. Draw a circle on the map. 3. Save boundary."
                          },
                          "introImages": {
                            "type": "array",
                            "items": {
                              "type": "string",
                              "format": "uri",
                              "example": "http://139.59.1.109:5000/uploads/feature-1716183050-999.png"
                            }
                          },
                          "buttonText": {
                            "type": "string",
                            "example": "Go to Geofence Alerts"
                          },
                          "redirectKey": {
                            "type": "string",
                            "example": "GEOFENCE_SETTING"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - Missing featureId"
            },
            "404": {
              "description": "Feature item not found or inactive"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        },
        "get": {
          "summary": "Retrieve walkthrough/intro details for a feature",
          "description": "Returns details of introductory screens, image slides, title, button labels, and redirection keys.",
          "tags": [
            "Features"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "featureId",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "The ObjectID of the feature item"
            }
          ],
          "responses": {
            "200": {
              "description": "Feature intro fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Feature intro fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "_id": {
                            "type": "string",
                            "example": "651f82f80c6be812b1d3ef15"
                          },
                          "categoryId": {
                            "type": "string",
                            "example": "651f82f80c6be812b1d3ef12"
                          },
                          "categoryTitle": {
                            "type": "string",
                            "example": "Security & Safety"
                          },
                          "title": {
                            "type": "string",
                            "example": "Geofence Alerts"
                          },
                          "screenTitle": {
                            "type": "string",
                            "example": "Geofence Alerts Intro"
                          },
                          "introTitle": {
                            "type": "string",
                            "example": "How to use Geofencing"
                          },
                          "introDescription": {
                            "type": "string",
                            "example": "1. Tap on Geofence. 2. Draw a circle on the map. 3. Save boundary."
                          },
                          "introImages": {
                            "type": "array",
                            "items": {
                              "type": "string",
                              "format": "uri",
                              "example": "http://139.59.1.109:5000/uploads/feature-1716183050-999.png"
                            }
                          },
                          "buttonText": {
                            "type": "string",
                            "example": "Go to Geofence Alerts"
                          },
                          "redirectKey": {
                            "type": "string",
                            "example": "GEOFENCE_SETTING"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - Missing featureId"
            },
            "404": {
              "description": "Feature item not found or inactive"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/geoFance/update_geofence": {
        "post": {
          "summary": "Update or add a geofence",
          "tags": [
            "GeoFence"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "imei": {
                      "type": "string"
                    },
                    "radius": {
                      "type": "number"
                    },
                    "latitude": {
                      "type": "number"
                    },
                    "longitude": {
                      "type": "number"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Geofence updated successfully"
            }
          }
        }
      },
      "/api/geoFance/geofenceData/{imei}": {
        "get": {
          "summary": "Get geofence data for a device",
          "tags": [
            "GeoFence"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "imei",
              "schema": {
                "type": "string"
              },
              "required": true,
              "description": "Device IMEI"
            }
          ],
          "responses": {
            "200": {
              "description": "Geofence data details"
            }
          }
        }
      },
      "/api/geoFance/geofence_all_Data": {
        "get": {
          "summary": "Get all geofences",
          "tags": [
            "GeoFence"
          ],
          "responses": {
            "200": {
              "description": "List of all geofences"
            }
          }
        }
      },
      "/api/geoFance/geofence/{imei}": {
        "delete": {
          "summary": "Delete a geofence by IMEI",
          "tags": [
            "GeoFence"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "imei",
              "schema": {
                "type": "string"
              },
              "required": true,
              "description": "Device IMEI"
            }
          ],
          "responses": {
            "200": {
              "description": "Geofence deleted successfully"
            }
          }
        }
      },
      "/api/geoFance/check-geofence": {
        "post": {
          "summary": "Check geofence history/data",
          "tags": [
            "GeoFence"
          ],
          "responses": {
            "200": {
              "description": "Geofence history record"
            }
          }
        }
      },
      "/api/health-insurance/health-insurance-options": {
        "post": {
          "summary": "Create a new health insurance option",
          "description": "Registers a new health insurance option or provider in the database.",
          "tags": [
            "Health Insurance"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "name"
                  ],
                  "properties": {
                    "name": {
                      "type": "string",
                      "description": "The name of the health insurance provider",
                      "example": "Star Health Insurance"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Health insurance option created successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Health insurance option created successfully"
                      },
                      "data": {
                        "$ref": "#/components/schemas/HealthInsuranceOption"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - Missing name parameter",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "name is required"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error"
            }
          }
        },
        "get": {
          "summary": "Retrieve active health insurance options",
          "description": "Returns a list of all active (status = 0) health insurance option/provider entries.",
          "tags": [
            "Health Insurance"
          ],
          "responses": {
            "200": {
              "description": "Health insurance options fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Health insurance options fetched successfully"
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "_id": {
                              "type": "string",
                              "example": "651f82f80c6be812b1d3ef12"
                            },
                            "name": {
                              "type": "string",
                              "example": "Star Health Insurance"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/health-insurance/health-insurance": {
        "post": {
          "summary": "Save or update user health insurance details",
          "description": "Creates or updates a user's health insurance details (blood group, provider, card number, and policy number).",
          "tags": [
            "Health Insurance"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "userId",
                    "bloodGroup",
                    "healthInsuranceId"
                  ],
                  "properties": {
                    "userId": {
                      "type": "string",
                      "description": "MongoDB ObjectID of the user",
                      "example": "651f82f80c6be812b1d3ef10"
                    },
                    "bloodGroup": {
                      "type": "string",
                      "description": "Blood group of the user",
                      "example": "O+"
                    },
                    "healthInsuranceId": {
                      "type": "string",
                      "description": "MongoDB ObjectID of the selected health insurance provider option",
                      "example": "651f82f80c6be812b1d3ef12"
                    },
                    "healthInsuranceCardNumber": {
                      "type": "string",
                      "description": "Health insurance card number (optional)",
                      "example": "SH-9876-5432-10"
                    },
                    "policyNumber": {
                      "type": "string",
                      "description": "Insurance policy number (optional)",
                      "example": "POL-09876543"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Health insurance detail saved successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Health insurance saved successfully"
                      },
                      "data": {
                        "$ref": "#/components/schemas/HealthInsuranceResponse"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - Missing required fields (userId, bloodGroup, healthInsuranceId)"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/health-insurance/health-insurance/{userId}": {
        "get": {
          "summary": "Retrieve health insurance detail for a specific user",
          "description": "Returns the detailed health insurance record of a user, populated with user info and selected insurance provider name.",
          "tags": [
            "Health Insurance"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "userId",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "The MongoDB ObjectID of the user"
            }
          ],
          "responses": {
            "200": {
              "description": "Health insurance detail fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Health insurance detail fetched successfully"
                      },
                      "data": {
                        "$ref": "#/components/schemas/HealthInsuranceResponse"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - Missing userId parameter"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/help/call-slots": {
        "post": {
          "summary": "Create a new call slot",
          "description": "Registers a new time slot in the system that users can book for issue resolution calls.",
          "tags": [
            "Help & Support"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "slotDate",
                    "startTime",
                    "endTime",
                    "displayTime"
                  ],
                  "properties": {
                    "slotDate": {
                      "type": "string",
                      "format": "date",
                      "description": "Date of the slot (YYYY-MM-DD)",
                      "example": "2026-05-20"
                    },
                    "startTime": {
                      "type": "string",
                      "description": "Start time of the slot",
                      "example": "10:00"
                    },
                    "endTime": {
                      "type": "string",
                      "description": "End time of the slot",
                      "example": "11:00"
                    },
                    "displayTime": {
                      "type": "string",
                      "description": "Formatted time range shown to the user",
                      "example": "10:00 AM - 11:00 AM"
                    },
                    "sortOrder": {
                      "type": "integer",
                      "description": "Order in which the slots should be displayed",
                      "example": 1
                    },
                    "isAvailable": {
                      "type": "boolean",
                      "description": "Whether the slot is currently available for booking",
                      "example": true
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Call slot created successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Call slot created successfully"
                      },
                      "data": {
                        "$ref": "#/components/schemas/CallSlot"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - Missing parameters"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        },
        "get": {
          "summary": "Retrieve available call slots",
          "description": "Returns a grouped list of active and available time slots starting from today.",
          "tags": [
            "Help & Support"
          ],
          "responses": {
            "200": {
              "description": "Available call slots fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Available call slots fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "screenTitle": {
                            "type": "string",
                            "example": "Book Call Slot for Solving Your Issue"
                          },
                          "importantTitle": {
                            "type": "string",
                            "example": "Important Point"
                          },
                          "importantDescription": {
                            "type": "string",
                            "example": "You need to be next to your vehicle during the issue resolution. Please keep yourself free :)"
                          },
                          "days": {
                            "type": "array",
                            "items": {
                              "$ref": "#/components/schemas/GroupedCallSlots"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/help/book-call-slot": {
        "post": {
          "summary": "Book a call slot for a vehicle issue",
          "description": "Registers a user help issue associated with a specific vehicle and call slot.",
          "tags": [
            "Help & Support"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "userId",
                    "imei",
                    "issueRelatedTo",
                    "description",
                    "callSlotId"
                  ],
                  "properties": {
                    "userId": {
                      "type": "string",
                      "description": "User MongoDB ObjectId",
                      "example": "69d4edbd81a3afcb12e63140"
                    },
                    "imei": {
                      "type": "string",
                      "description": "The IMEI of the vehicle",
                      "example": "860710085959719"
                    },
                    "issueType": {
                      "type": "string",
                      "enum": [
                        "report_issue",
                        "suggestion"
                      ],
                      "default": "report_issue",
                      "example": "report_issue"
                    },
                    "issueRelatedTo": {
                      "type": "string",
                      "description": "Category or general area of the issue",
                      "example": "GPS Tracking Issue"
                    },
                    "description": {
                      "type": "string",
                      "maxLength": 200,
                      "description": "Details of the issue (max 200 characters)",
                      "example": "Vehicle location is not updating since yesterday."
                    },
                    "callSlotId": {
                      "type": "string",
                      "description": "CallSlot MongoDB ObjectId",
                      "example": "69da237aed0e5121f459bfbd"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Call slot booked successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Call slot booked successfully"
                      },
                      "data": {
                        "$ref": "#/components/schemas/BookedIssueResponse"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - Missing parameters or description exceeds 200 characters"
            },
            "404": {
              "description": "Vehicle not found or selected slot is unavailable"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/help/my-issues/{userId}": {
        "get": {
          "summary": "Retrieve issues reported by a user",
          "description": "Returns a list of all issues submitted by a specific user.",
          "tags": [
            "Help & Support"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "userId",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "User MongoDB ObjectId",
              "example": "69d4edbd81a3afcb12e63140"
            }
          ],
          "responses": {
            "200": {
              "description": "My issues fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "My issues fetched successfully"
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/UserIssueResponse"
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - Missing userId"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/help/suggestions": {
        "post": {
          "summary": "Submit a suggestion",
          "description": "Submit feedback or feature suggestions.",
          "tags": [
            "Help & Support"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "userId",
                    "suggestionType",
                    "subject",
                    "description"
                  ],
                  "properties": {
                    "userId": {
                      "type": "string",
                      "description": "User MongoDB ObjectId",
                      "example": "69d4edbd81a3afcb12e63140"
                    },
                    "suggestionType": {
                      "type": "string",
                      "description": "Category of suggestion",
                      "example": "app_feature"
                    },
                    "subject": {
                      "type": "string",
                      "description": "Suggestion subject",
                      "example": "Dark Mode option"
                    },
                    "description": {
                      "type": "string",
                      "maxLength": 200,
                      "description": "Description of the suggestion (max 200 characters)",
                      "example": "Please add a toggle to support system dark mode."
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Suggestion submitted successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Suggestion submitted successfully"
                      },
                      "data": {
                        "$ref": "#/components/schemas/UserSuggestionResponse"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - Missing parameters or description exceeds 200 characters"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/help/my-suggestions/{userId}": {
        "get": {
          "summary": "Retrieve suggestions submitted by a user",
          "description": "Returns a list of all suggestions submitted by a specific user.",
          "tags": [
            "Help & Support"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "userId",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "User MongoDB ObjectId",
              "example": "69d4edbd81a3afcb12e63140"
            }
          ],
          "responses": {
            "200": {
              "description": "My suggestions fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "My suggestions fetched successfully"
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/UserSuggestionItem"
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - Missing userId"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/journey/ride-history": {
        "post": {
          "summary": "Get ride history summary and current location",
          "description": "Retrieve ride history, summary, and current location for a given device IMEI for today.",
          "tags": [
            "Journey"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "imei": {
                      "type": "string",
                      "example": "123456789012345"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Ride data fetched successfully"
            },
            "400": {
              "description": "IMEI is required"
            },
            "404": {
              "description": "No data found"
            },
            "500": {
              "description": "Server error"
            }
          }
        }
      },
      "/api/upload-logo": {
        "post": {
          "summary": "Upload a logo file",
          "tags": [
            "Logo"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "logo": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Logo uploaded successfully"
            }
          }
        }
      },
      "/api/logoUrl": {
        "get": {
          "summary": "Get all logos URLs",
          "tags": [
            "Logo"
          ],
          "responses": {
            "200": {
              "description": "URLs list for logos"
            }
          }
        }
      },
      "/api/newtheme/theme": {
        "get": {
          "summary": "Get current new theme",
          "tags": [
            "New Theme"
          ],
          "responses": {
            "200": {
              "description": "New theme settings"
            }
          }
        },
        "post": {
          "summary": "Save new theme",
          "tags": [
            "New Theme"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "New theme saved successfully"
            }
          }
        }
      },
      "/api/notification/{userId}": {
        "get": {
          "summary": "Get notifications for a user",
          "description": "Fetches all notifications for a specific user, sorted by latest first. Populates user and vehicle details.",
          "tags": [
            "Notification"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "userId",
              "schema": {
                "type": "string"
              },
              "required": true,
              "description": "The user ID to fetch notifications for"
            }
          ],
          "responses": {
            "200": {
              "description": "Notifications fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Notifications fetched successfully"
                      },
                      "count": {
                        "type": "integer",
                        "example": 5
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "_id": {
                              "type": "string"
                            },
                            "userId": {
                              "type": "object",
                              "properties": {
                                "_id": {
                                  "type": "string"
                                },
                                "name": {
                                  "type": "string"
                                },
                                "email": {
                                  "type": "string"
                                },
                                "role": {
                                  "type": "string"
                                }
                              }
                            },
                            "title": {
                              "type": "string"
                            },
                            "description": {
                              "type": "string"
                            },
                            "vehicleId": {
                              "type": "object"
                            },
                            "createdAt": {
                              "type": "string",
                              "format": "date-time"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "userId is required"
            },
            "500": {
              "description": "Database error"
            }
          }
        }
      },
      "/api/overspeed/create-alert": {
        "post": {
          "summary": "Create a new overspeed alert",
          "tags": [
            "Overspeed Alerts"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "alert_title",
                    "speed_limit",
                    "duration",
                    "imei"
                  ],
                  "properties": {
                    "alert_title": {
                      "type": "string",
                      "description": "Title for the overspeed alert"
                    },
                    "speed_limit": {
                      "type": "number",
                      "description": "Speed limit in km/h"
                    },
                    "duration": {
                      "type": "number",
                      "description": "Duration for which speed exceeds limit (if applicable)"
                    },
                    "imei": {
                      "type": "string",
                      "description": "IMEI of the vehicle"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Overspeed alert created successfully"
            },
            "400": {
              "description": "Bad request (Missing required fields)"
            },
            "404": {
              "description": "Vehicle not found"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/overspeed/check-overspeed": {
        "post": {
          "summary": "Check vehicle speed and send notification if limit exceeded",
          "tags": [
            "Overspeed Alerts"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "imei",
                    "speed"
                  ],
                  "properties": {
                    "imei": {
                      "type": "string",
                      "description": "IMEI of the vehicle"
                    },
                    "speed": {
                      "type": "number",
                      "description": "Current speed of the vehicle"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Speed checked (Notification sent if limit exceeded)"
            },
            "400": {
              "description": "Bad request (Missing imei or speed)"
            },
            "404": {
              "description": "Vehicle or overspeed alert not found"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/overspeed/get-overspeed/{imei}": {
        "get": {
          "summary": "Retrieve overspeed alerts by IMEI",
          "tags": [
            "Overspeed Alerts"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "imei",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "IMEI of the vehicle"
            }
          ],
          "responses": {
            "200": {
              "description": "Overspeed alerts fetched successfully"
            },
            "400": {
              "description": "Bad request (IMEI is required)"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/plus-membership/plus-plan": {
        "post": {
          "summary": "Create a new Plus Plan",
          "description": "Creates a new Ajjas Plus Membership subscription plan.",
          "tags": [
            "Plus Membership"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "price"
                  ],
                  "properties": {
                    "planName": {
                      "type": "string",
                      "example": "Ajjas Plus Membership"
                    },
                    "tagText": {
                      "type": "string",
                      "example": "Specially For You"
                    },
                    "price": {
                      "type": "number",
                      "example": 999
                    },
                    "originalPrice": {
                      "type": "number",
                      "example": 1999
                    },
                    "durationMonths": {
                      "type": "number",
                      "example": 12
                    },
                    "durationText": {
                      "type": "string",
                      "example": "for 1 year"
                    },
                    "boughtText": {
                      "type": "string",
                      "example": "Over 10k users bought this"
                    },
                    "buttonText": {
                      "type": "string",
                      "example": "Upgrade Now at Just ₹999"
                    },
                    "premiumBenefits": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "example": [
                        "GPS Tracking",
                        "Priority Alerts"
                      ]
                    },
                    "otherBenefits": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "example": [
                        "24/7 Roadside Assistance"
                      ]
                    },
                    "reviews": {
                      "type": "array",
                      "items": {
                        "type": "object"
                      },
                      "example": [
                        {
                          "name": "John Doe",
                          "rating": 5,
                          "comment": "Great membership!"
                        }
                      ]
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Plus plan created successfully"
            },
            "400": {
              "description": "Price is required or bad request"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        },
        "get": {
          "summary": "Fetch current Plus Plan details",
          "description": "Retrieves the active membership plan along with active subscription details if userId query parameter is passed.",
          "tags": [
            "Plus Membership"
          ],
          "responses": {
            "200": {
              "description": "Plus plan fetched successfully"
            },
            "404": {
              "description": "Plus plan not found"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/plus-membership/plus-membership/activate": {
        "post": {
          "summary": "Activate plus membership for a user",
          "description": "Activates membership subscription for a user by creating a UserPlusMembership record.",
          "tags": [
            "Plus Membership"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "userId",
                    "planId"
                  ],
                  "properties": {
                    "userId": {
                      "type": "string",
                      "example": "60d0fe4f5311236168a109ca"
                    },
                    "planId": {
                      "type": "string",
                      "example": "60d0fe4f5311236168a109cb"
                    },
                    "amountPaid": {
                      "type": "number",
                      "example": 999
                    },
                    "transactionId": {
                      "type": "string",
                      "example": "TXN123456789"
                    },
                    "paymentStatus": {
                      "type": "string",
                      "enum": [
                        "paid",
                        "pending",
                        "failed"
                      ],
                      "example": "paid"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Plus membership activated successfully"
            },
            "400": {
              "description": "userId or planId is missing"
            },
            "404": {
              "description": "Plus plan not found"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/plus-membership/plus-membership/status/{userId}": {
        "get": {
          "summary": "Get user membership status",
          "description": "Retrieves user's active membership subscription details and remaining days.",
          "tags": [
            "Plus Membership"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "userId",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "Unique ID of the user.",
              "example": "60d0fe4f5311236168a109ca"
            }
          ],
          "responses": {
            "200": {
              "description": "Plus membership status fetched successfully"
            },
            "400": {
              "description": "userId is required"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/promo/create": {
        "post": {
          "summary": "Create a new promo video",
          "tags": [
            "PromoVideo"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "title",
                    "video_url",
                    "thumbnail_url"
                  ],
                  "properties": {
                    "title": {
                      "type": "string",
                      "description": "Title of the promo video"
                    },
                    "video_url": {
                      "type": "string",
                      "description": "URL of the promo video"
                    },
                    "thumbnail_url": {
                      "type": "string",
                      "format": "binary",
                      "description": "Thumbnail image file"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Promo video created successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Promo video created successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "_id": {
                            "type": "string"
                          },
                          "title": {
                            "type": "string"
                          },
                          "video_url": {
                            "type": "string"
                          },
                          "thumbnail_url": {
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Missing required fields"
            },
            "500": {
              "description": "Server error"
            }
          }
        }
      },
      "/api/promo/all": {
        "get": {
          "summary": "Get all promo videos",
          "tags": [
            "PromoVideo"
          ],
          "responses": {
            "200": {
              "description": "List of all promo videos",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "_id": {
                              "type": "string"
                            },
                            "title": {
                              "type": "string"
                            },
                            "video_url": {
                              "type": "string"
                            },
                            "thumbnail_url": {
                              "type": "string",
                              "description": "Full URL to the thumbnail image"
                            },
                            "createdAt": {
                              "type": "string",
                              "format": "date-time"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Server error"
            }
          }
        }
      },
      "/api/service/service-logs": {
        "post": {
          "summary": "Create a new service log",
          "tags": [
            "Service Logs"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "service_date",
                    "billing_amount",
                    "service_center_name",
                    "service_center_contact"
                  ],
                  "properties": {
                    "service_date": {
                      "type": "string",
                      "format": "date",
                      "description": "Date of the service"
                    },
                    "billing_amount": {
                      "type": "number",
                      "description": "Amount billed for the service"
                    },
                    "service_center_name": {
                      "type": "string",
                      "description": "Name of the service center"
                    },
                    "service_center_contact": {
                      "type": "string",
                      "description": "Contact number of the service center"
                    },
                    "additional_note": {
                      "type": "string",
                      "description": "Any additional notes"
                    },
                    "vehicle_id": {
                      "type": "string",
                      "description": "ID of the vehicle (Required if imei is not provided)"
                    },
                    "imei": {
                      "type": "string",
                      "description": "IMEI of the vehicle (Required if vehicle_id is not provided)"
                    },
                    "service_bill_image": {
                      "type": "string",
                      "format": "binary",
                      "description": "Image of the service bill"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Service log created successfully"
            },
            "400": {
              "description": "Bad request (Missing required fields or invalid data)"
            },
            "404": {
              "description": "Vehicle not found"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        },
        "get": {
          "summary": "Retrieve service logs",
          "tags": [
            "Service Logs"
          ],
          "parameters": [
            {
              "in": "query",
              "name": "vehicle_id",
              "schema": {
                "type": "string"
              },
              "description": "Vehicle ID to filter logs (Required if imei is not provided)"
            },
            {
              "in": "query",
              "name": "imei",
              "schema": {
                "type": "string"
              },
              "description": "IMEI to filter logs (Required if vehicle_id is not provided)"
            },
            {
              "in": "query",
              "name": "start_date",
              "schema": {
                "type": "string",
                "format": "date"
              },
              "description": "Start date for filtering logs"
            },
            {
              "in": "query",
              "name": "end_date",
              "schema": {
                "type": "string",
                "format": "date"
              },
              "description": "End date for filtering logs"
            }
          ],
          "responses": {
            "200": {
              "description": "Service logs fetched successfully"
            },
            "400": {
              "description": "Bad request (vehicle_id or imei is required)"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/statistics/{imei}": {
        "get": {
          "summary": "Get statistics for a vehicle by IMEI",
          "description": "Retrieves riding behaviour, journey, speed, and fuel consumption statistics for a vehicle on a selected date.",
          "tags": [
            "Statistics"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "imei",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "The IMEI number of the vehicle.",
              "example": "123456789012345"
            },
            {
              "in": "query",
              "name": "date",
              "required": false,
              "schema": {
                "type": "string",
                "format": "date"
              },
              "description": "The date for which to fetch statistics. Defaults to the current date if not provided.",
              "example": "2026-05-21"
            }
          ],
          "responses": {
            "200": {
              "description": "Statistics fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Statistics fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "selectedDate": {
                            "type": "object",
                            "properties": {
                              "date": {
                                "type": "string",
                                "example": "2026-05-21"
                              },
                              "displayText": {
                                "type": "string",
                                "example": "May 21 (Today)"
                              },
                              "previousDate": {
                                "type": "string",
                                "example": "2026-05-20"
                              },
                              "nextDate": {
                                "type": "string",
                                "example": "2026-05-22"
                              }
                            }
                          },
                          "vehicle": {
                            "type": "object",
                            "properties": {
                              "_id": {
                                "type": "string",
                                "example": "60d0fe4f5311236168a109ca"
                              },
                              "userId": {
                                "type": "string",
                                "example": "60d0fe4f5311236168a109cb"
                              },
                              "imei": {
                                "type": "string",
                                "example": "123456789012345"
                              },
                              "vehicleName": {
                                "type": "string",
                                "example": "Model S"
                              },
                              "vehicleNumber": {
                                "type": "string",
                                "example": "CA123456"
                              },
                              "displayName": {
                                "type": "string",
                                "example": "Model S CA123456"
                              }
                            }
                          },
                          "ridingBehaviour": {
                            "type": "object",
                            "properties": {
                              "score": {
                                "type": "number",
                                "example": 95
                              },
                              "scoreText": {
                                "type": "string",
                                "example": "95%"
                              },
                              "statusText": {
                                "type": "string",
                                "example": "Excellent"
                              },
                              "comparisonText": {
                                "type": "string",
                                "example": "+5% vs previous period"
                              }
                            }
                          },
                          "journey": {
                            "type": "object",
                            "properties": {
                              "distanceTravelled": {
                                "type": "number",
                                "example": 25.4
                              },
                              "distanceTravelledText": {
                                "type": "string",
                                "example": "25.4 km"
                              },
                              "timeDurationMinutes": {
                                "type": "number",
                                "example": 45
                              },
                              "timeDurationText": {
                                "type": "string",
                                "example": "45m"
                              },
                              "distanceComparisonText": {
                                "type": "string",
                                "example": "+10% vs previous period"
                              },
                              "durationComparisonText": {
                                "type": "string",
                                "example": "+8% vs previous period"
                              }
                            }
                          },
                          "speed": {
                            "type": "object",
                            "properties": {
                              "averageSpeed": {
                                "type": "number",
                                "example": 45.2
                              },
                              "averageSpeedText": {
                                "type": "string",
                                "example": "45.2 km/hr"
                              },
                              "topSpeed": {
                                "type": "number",
                                "example": 85
                              },
                              "topSpeedText": {
                                "type": "string",
                                "example": "85.0 km/hr"
                              },
                              "averageSpeedComparisonText": {
                                "type": "string",
                                "example": "+3% vs previous period"
                              },
                              "topSpeedComparisonText": {
                                "type": "string",
                                "example": "+12% vs previous period"
                              }
                            }
                          },
                          "fuel": {
                            "type": "object",
                            "properties": {
                              "fuelConsumed": {
                                "type": "number",
                                "example": 2.1
                              },
                              "fuelConsumedText": {
                                "type": "string",
                                "example": "2.1 L"
                              },
                              "fuelCost": {
                                "type": "number",
                                "example": 210
                              },
                              "fuelCostText": {
                                "type": "string",
                                "example": "₹210.0"
                              },
                              "fuelConsumedComparisonText": {
                                "type": "string",
                                "example": "-2% vs previous period"
                              },
                              "fuelCostComparisonText": {
                                "type": "string",
                                "example": "-2% vs previous period"
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "IMEI is required"
            },
            "404": {
              "description": "Vehicle not found for this IMEI"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/theme/create": {
        "post": {
          "summary": "Create a new theme",
          "tags": [
            "Theme"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "primaryColor": {
                      "type": "string"
                    },
                    "secondaryColor": {
                      "type": "string"
                    },
                    "logo": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Theme created successfully"
            }
          }
        }
      },
      "/api/theme": {
        "get": {
          "summary": "Get the latest theme",
          "tags": [
            "Theme"
          ],
          "responses": {
            "200": {
              "description": "Current theme settings"
            }
          }
        }
      },
      "/api/theme/update/{id}": {
        "put": {
          "summary": "Update a theme by ID",
          "tags": [
            "Theme"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "schema": {
                "type": "string"
              },
              "required": true,
              "description": "Theme record ID"
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Theme updated successfully"
            }
          }
        }
      },
      "/user/customer-list": {
        "get": {
          "summary": "Get listing of customers",
          "tags": [
            "User"
          ],
          "responses": {
            "200": {
              "description": "List of customers"
            }
          }
        }
      },
      "/user/userList/{id}": {
        "get": {
          "summary": "Get user list by ID",
          "tags": [
            "User"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "id",
              "schema": {
                "type": "string"
              },
              "required": true,
              "description": "The ID of the user or related entity"
            }
          ],
          "responses": {
            "200": {
              "description": "User information details"
            }
          }
        }
      },
      "/user/save-fcm-token": {
        "post": {
          "summary": "Save FCM token for a user",
          "tags": [
            "User"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "userId",
                    "fcmToken"
                  ],
                  "properties": {
                    "userId": {
                      "type": "string",
                      "description": "The ID of the user"
                    },
                    "fcmToken": {
                      "type": "string",
                      "description": "The FCM token to save"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "FCM token saved successfully"
            },
            "400": {
              "description": "userId and fcmToken are required"
            },
            "404": {
              "description": "User not found"
            },
            "500": {
              "description": "Server error"
            }
          }
        }
      },
      "/api/vehicle-control/create": {
        "post": {
          "summary": "Create new vehicle control detail",
          "description": "Creates vehicle control specifications for a given IMEI. Supports uploading a vehicle image.",
          "tags": [
            "VehicleControl"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "imei"
                  ],
                  "properties": {
                    "imei": {
                      "type": "string",
                      "description": "Unique IMEI of the vehicle/device",
                      "example": "123456789012345"
                    },
                    "tankCapacity": {
                      "type": "number",
                      "description": "Fuel tank capacity in liters",
                      "example": 55
                    },
                    "vehicleMileage": {
                      "type": "number",
                      "description": "Mileage performance (km per liter)",
                      "example": 12.5
                    },
                    "vehicleLock": {
                      "type": "boolean",
                      "description": "Lock state of the vehicle",
                      "example": false
                    },
                    "vehicleIcon": {
                      "type": "string",
                      "description": "Icon type name representing the vehicle",
                      "example": "car"
                    },
                    "vehicleColor": {
                      "type": "string",
                      "description": "Hex or color string representing the vehicle color",
                      "example": "#FF0000"
                    },
                    "vehicleImage": {
                      "type": "string",
                      "format": "binary",
                      "description": "Vehicle image file upload"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Vehicle control details created successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Vehicle control detail created successfully"
                      },
                      "data": {
                        "$ref": "#/components/schemas/VehicleControl"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request or vehicle control detail already exists"
            },
            "404": {
              "description": "Vehicle not found in system"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/vehicle-control/list": {
        "get": {
          "summary": "Retrieve all vehicle control details",
          "description": "Returns a list of all vehicle control records enriched with their matching vehicle definitions.",
          "tags": [
            "VehicleControl"
          ],
          "responses": {
            "200": {
              "description": "List of vehicle controls fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "count": {
                        "type": "integer",
                        "example": 1
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/VehicleControlDetailResponse"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/vehicle-control/{imei}": {
        "get": {
          "summary": "Get vehicle control detail by IMEI",
          "description": "Retrieve specific vehicle control specifications alongside vehicle metadata using the vehicle's IMEI.",
          "tags": [
            "VehicleControl"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "imei",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "Unique IMEI of the vehicle",
              "example": "123456789012345"
            }
          ],
          "responses": {
            "200": {
              "description": "Vehicle control details retrieved successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "data": {
                        "$ref": "#/components/schemas/VehicleControlDetailResponse"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Vehicle control detail not found"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/vehicle-control/update/{imei}": {
        "put": {
          "summary": "Update vehicle control details by IMEI",
          "description": "Updates existing control attributes (e.g. tank capacity, lock, icon) and/or replaces the vehicle image.",
          "tags": [
            "VehicleControl"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "imei",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "Unique IMEI of the vehicle to update",
              "example": "123456789012345"
            }
          ],
          "requestBody": {
            "required": false,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "tankCapacity": {
                      "type": "number",
                      "example": 60
                    },
                    "vehicleMileage": {
                      "type": "number",
                      "example": 14
                    },
                    "vehicleLock": {
                      "type": "boolean",
                      "example": true
                    },
                    "vehicleIcon": {
                      "type": "string",
                      "example": "suv"
                    },
                    "vehicleColor": {
                      "type": "string",
                      "example": "#0000FF"
                    },
                    "vehicleImage": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Vehicle control details updated successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Vehicle control detail updated successfully"
                      },
                      "data": {
                        "$ref": "#/components/schemas/VehicleControl"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Vehicle control detail not found"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/vehicle-control/lock-unlock/{imei}": {
        "put": {
          "summary": "Toggle vehicle lock state",
          "description": "Inverts the current lock state of the vehicle (locks if unlocked, unlocks if locked).",
          "tags": [
            "VehicleControl"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "imei",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "Unique IMEI of the vehicle to toggle lock status",
              "example": "123456789012345"
            }
          ],
          "responses": {
            "200": {
              "description": "Vehicle lock status toggled successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Vehicle locked successfully"
                      },
                      "data": {
                        "$ref": "#/components/schemas/VehicleControl"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Vehicle control detail not found"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/vehicle-control/delete/{imei}": {
        "delete": {
          "summary": "Delete vehicle control detail",
          "description": "Deletes the vehicle control record matching the specified IMEI.",
          "tags": [
            "VehicleControl"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "imei",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "Unique IMEI of the vehicle control to delete",
              "example": "123456789012345"
            }
          ],
          "responses": {
            "200": {
              "description": "Vehicle control details deleted successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Vehicle control detail deleted successfully"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Vehicle control detail not found"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/vehicle-refuel/create": {
        "post": {
          "summary": "Create a refuel entry",
          "description": "Adds a new fuel refilling entry for a vehicle based on its IMEI, calculating the total fuel filled.",
          "tags": [
            "VehicleRefuel"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "imei",
                    "refuelDate",
                    "refuelTime",
                    "currentOdometer",
                    "totalAmount",
                    "pricePerLiter",
                    "tankStatus"
                  ],
                  "properties": {
                    "imei": {
                      "type": "string",
                      "description": "Unique IMEI of the vehicle/device",
                      "example": "123456789012345"
                    },
                    "refuelDate": {
                      "type": "string",
                      "description": "Date of refilling (e.g. YYYY-MM-DD or custom string format)",
                      "example": "2026-05-18"
                    },
                    "refuelTime": {
                      "type": "string",
                      "description": "Time of refilling (e.g. HH:MM or custom string format)",
                      "example": "14:30"
                    },
                    "currentOdometer": {
                      "type": "number",
                      "description": "Odometer reading at refuel point",
                      "example": 45200
                    },
                    "totalAmount": {
                      "type": "number",
                      "description": "Total cost/amount spent on fuel",
                      "example": 3000
                    },
                    "pricePerLiter": {
                      "type": "number",
                      "description": "Price per liter of fuel",
                      "example": 100
                    },
                    "tankStatus": {
                      "type": "integer",
                      "enum": [
                        1,
                        2
                      ],
                      "description": "Fuel tank fill status (1 = Full Tank, 2 = Partial Tank)",
                      "example": 1
                    },
                    "fuelBeforeRefuel": {
                      "type": "number",
                      "description": "Current fuel level before refueling. Required if tankStatus is 2 (partial).",
                      "example": 15
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Refuel entry added successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Refuel added successfully"
                      },
                      "data": {
                        "$ref": "#/components/schemas/VehicleRefuel"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request (e.g. fuelBeforeRefuel is required for partial tank)"
            },
            "404": {
              "description": "Vehicle not found"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/vehicle-refuel/list": {
        "get": {
          "summary": "Get all refuel entries",
          "description": "Returns a list of all refueling records sorted by latest creation date.",
          "tags": [
            "VehicleRefuel"
          ],
          "responses": {
            "200": {
              "description": "List of refuel entries",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "count": {
                        "type": "integer",
                        "example": 5
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/VehicleRefuel"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/vehicle-refuel/{imei}": {
        "get": {
          "summary": "Get refuel entries by IMEI",
          "description": "Retrieve all refueling records for a specific vehicle using its IMEI, sorted by latest first.",
          "tags": [
            "VehicleRefuel"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "imei",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "Unique IMEI of the vehicle",
              "example": "123456789012345"
            }
          ],
          "responses": {
            "200": {
              "description": "Refuel entries for the specified IMEI retrieved successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "count": {
                        "type": "integer",
                        "example": 2
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/VehicleRefuel"
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/vehicle-refuel/fuel-log-details/{imei}": {
        "get": {
          "summary": "Get real-time fuel log details",
          "description": "Calculates weekly/monthly fuel spends, average consumption metrics, and estimated fuel & distance remaining based on vehicle controls and last refueling log.",
          "tags": [
            "VehicleRefuel"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "imei",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "Unique IMEI of the vehicle",
              "example": "123456789012345"
            }
          ],
          "responses": {
            "200": {
              "description": "Fuel log calculations retrieved successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Fuel log details fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "imei": {
                            "type": "string",
                            "example": "123456789012345"
                          },
                          "vehicleImage": {
                            "type": "string",
                            "nullable": true,
                            "example": "http://localhost:5000/uploads/vehicleImage-169827393.jpg"
                          },
                          "vehicleIcon": {
                            "type": "string",
                            "example": "car"
                          },
                          "vehicleColor": {
                            "type": "string",
                            "example": "#FF0000"
                          },
                          "tankCapacity": {
                            "type": "number",
                            "example": 55
                          },
                          "vehicleMileage": {
                            "type": "number",
                            "example": 12.5
                          },
                          "odometerReading": {
                            "type": "number",
                            "example": 45200
                          },
                          "lastRefuel": {
                            "type": "object",
                            "nullable": true,
                            "properties": {
                              "date": {
                                "type": "string",
                                "example": "2026-05-18"
                              },
                              "time": {
                                "type": "string",
                                "example": "14:30"
                              },
                              "amount": {
                                "type": "number",
                                "example": 3000
                              },
                              "fuelFilled": {
                                "type": "number",
                                "example": 30
                              },
                              "pricePerLiter": {
                                "type": "number",
                                "example": 100
                              },
                              "tankStatus": {
                                "type": "integer",
                                "example": 1
                              }
                            }
                          },
                          "fuelRemaining": {
                            "type": "number",
                            "example": 55
                          },
                          "distanceRemaining": {
                            "type": "number",
                            "example": 687.5
                          },
                          "distanceTravelled": {
                            "type": "number",
                            "example": 0
                          },
                          "spending": {
                            "type": "object",
                            "properties": {
                              "thisWeekAmount": {
                                "type": "number",
                                "example": 3000
                              },
                              "thisWeekFuel": {
                                "type": "number",
                                "example": 30
                              },
                              "thisMonthAmount": {
                                "type": "number",
                                "example": 3000
                              },
                              "thisMonthFuel": {
                                "type": "number",
                                "example": 30
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Vehicle control detail not found"
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/vehicle/get-vehicles": {
        "get": {
          "summary": "Get all vehicles by userId",
          "description": "Retrieves a list of all vehicles assigned to a specific user using their unique User ID.",
          "tags": [
            "Vehicle"
          ],
          "parameters": [
            {
              "in": "query",
              "name": "userId",
              "schema": {
                "type": "string"
              },
              "required": true,
              "description": "The unique identifier of the user (e.g., \"69d3a0a2ee09adeb830d48e0\")."
            }
          ],
          "responses": {
            "200": {
              "description": "A successful response with the list of vehicles."
            },
            "400": {
              "description": "Missing or invalid userId."
            }
          }
        }
      },
      "/api/vehicle/vehicle-config": {
        "get": {
          "summary": "Get vehicle configuration",
          "description": "Fetches global configuration settings for vehicles, such as types and fuel options.",
          "tags": [
            "Vehicle"
          ],
          "responses": {
            "200": {
              "description": "Vehicle configuration settings retrieved successfully."
            }
          }
        }
      },
      "/api/vehicle/makers": {
        "get": {
          "summary": "Get vehicle makers",
          "description": "Provides a list of vehicle manufacturers filtered by vehicle type and fuel type.",
          "tags": [
            "Vehicle"
          ],
          "parameters": [
            {
              "in": "query",
              "name": "vehicleType",
              "schema": {
                "type": "string"
              },
              "required": true,
              "description": "The type of vehicle (e.g., \"4_wheeler\", \"2_wheeler\")."
            },
            {
              "in": "query",
              "name": "fuelType",
              "schema": {
                "type": "string"
              },
              "required": true,
              "description": "The preferred fuel type (e.g., \"petrol\", \"diesel\", \"electric\")."
            }
          ],
          "responses": {
            "200": {
              "description": "A list of matching vehicle makers."
            }
          }
        }
      },
      "/api/vehicle/models": {
        "get": {
          "summary": "Get vehicle models",
          "description": "Retrieves vehicle models based on the selected type, fuel, and brand.",
          "tags": [
            "Vehicle"
          ],
          "parameters": [
            {
              "in": "query",
              "name": "vehicleType",
              "schema": {
                "type": "string"
              },
              "example": "4_wheeler",
              "required": true,
              "description": "The category of the vehicle (e.g., \"4_wheeler\")."
            },
            {
              "in": "query",
              "name": "fuelType",
              "schema": {
                "type": "string"
              },
              "example": "petrol",
              "required": true,
              "description": "The type of fuel used by the vehicle."
            },
            {
              "in": "query",
              "name": "brandId",
              "schema": {
                "type": "string"
              },
              "example": "69da237aed0e5121f459bfbb",
              "required": true,
              "description": "The unique MongoID of the vehicle brand."
            }
          ],
          "responses": {
            "200": {
              "description": "A list of matching vehicle models."
            }
          }
        }
      },
      "/api/vehicle/vehicle": {
        "post": {
          "summary": "Save vehicle details",
          "tags": [
            "Vehicle"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "userId": {
                      "type": "string"
                    },
                    "vehicleType": {
                      "type": "string"
                    },
                    "fuelType": {
                      "type": "string"
                    },
                    "brandId": {
                      "type": "string"
                    },
                    "modelId": {
                      "type": "string"
                    },
                    "vehicleNumber": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Vehicle saved successfully"
            }
          }
        }
      },
      "/api/add-video-tutorial": {
        "post": {
          "summary": "Add a new video tutorial",
          "tags": [
            "VideoTutorial"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "required": [
                    "category_id",
                    "video_title",
                    "video_url"
                  ],
                  "properties": {
                    "category_id": {
                      "type": "string",
                      "description": "ID of the video tutorial category"
                    },
                    "video_title": {
                      "type": "string",
                      "description": "Title of the video tutorial"
                    },
                    "video_url": {
                      "type": "string",
                      "description": "URL of the video tutorial"
                    },
                    "video_thumbnail": {
                      "type": "string",
                      "format": "binary",
                      "description": "Thumbnail image file for the video"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Video tutorial added successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Video tutorial added successfully"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "All fields are required",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "All fields are required"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/video-tutorials": {
        "get": {
          "summary": "Get all video tutorials with category info",
          "tags": [
            "VideoTutorial"
          ],
          "responses": {
            "200": {
              "description": "Video tutorials fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Video tutorials fetched successfully"
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string"
                            },
                            "category_id": {
                              "type": "string"
                            },
                            "category_name": {
                              "type": "string"
                            },
                            "video_title": {
                              "type": "string"
                            },
                            "video_thumbnail": {
                              "type": "string",
                              "description": "Full URL to the thumbnail image"
                            },
                            "video_url": {
                              "type": "string"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/api/video-tutorials-list": {
        "get": {
          "summary": "Get video tutorial list, optionally filtered by category",
          "tags": [
            "VideoTutorial"
          ],
          "parameters": [
            {
              "in": "query",
              "name": "category_id",
              "schema": {
                "type": "string"
              },
              "required": false,
              "description": "Filter videos by category ID"
            }
          ],
          "responses": {
            "200": {
              "description": "Video tutorials fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Video tutorials fetched successfully"
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string"
                            },
                            "video_title": {
                              "type": "string"
                            },
                            "video_thumbnail": {
                              "type": "string"
                            },
                            "video_url": {
                              "type": "string"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/add-video-tutorial-category": {
        "post": {
          "summary": "Add a new video tutorial category",
          "tags": [
            "VideoTutorialCategory"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "category_name"
                  ],
                  "properties": {
                    "category_name": {
                      "type": "string",
                      "description": "Name of the video tutorial category",
                      "example": "Beginner Tutorials"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Video tutorial category added successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Video tutorial category added successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "id": {
                            "type": "string",
                            "description": "Category ID"
                          },
                          "category_name": {
                            "type": "string",
                            "example": "Beginner Tutorials"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Validation error or category already exists",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Category already exists"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/video-tutorials-category": {
        "get": {
          "summary": "Get all video tutorial categories",
          "tags": [
            "VideoTutorialCategory"
          ],
          "responses": {
            "200": {
              "description": "Video tutorial categories fetched successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "status": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Video tutorial categories fetched successfully"
                      },
                      "data": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "description": "Category ID"
                            },
                            "category_name": {
                              "type": "string",
                              "example": "Beginner Tutorials"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error"
            }
          }
        }
      },
      "/api/warranty/warranty-plans": {
        "post": {
          "summary": "Create a new warranty plan",
          "description": "Creates a new warranty package configuration that can be offered to users to extend their device warranty.",
          "tags": [
            "Warranties"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "planName",
                    "durationMonths",
                    "originalPrice",
                    "offerPrice"
                  ],
                  "properties": {
                    "planName": {
                      "type": "string",
                      "description": "Name of the warranty plan",
                      "example": "1 Year Extended Warranty"
                    },
                    "durationMonths": {
                      "type": "number",
                      "description": "Coverage duration in months",
                      "example": 12
                    },
                    "originalPrice": {
                      "type": "number",
                      "description": "Original pricing of the plan",
                      "example": 999
                    },
                    "offerPrice": {
                      "type": "number",
                      "description": "Discounted offer pricing of the plan",
                      "example": 365
                    },
                    "discountText": {
                      "type": "string",
                      "description": "Marketing/discount label text",
                      "example": "Booster offer @60% OFF"
                    },
                    "title": {
                      "type": "string",
                      "description": "Display title for user offers",
                      "example": "Extend warranty of your Ajjas Lite by 1 year @ ₹1/day"
                    },
                    "subtitle": {
                      "type": "string",
                      "description": "Optional subtitle for promotional messaging",
                      "example": "Secure your vehicle tracking uninterrupted"
                    },
                    "productName": {
                      "type": "string",
                      "description": "Name of the associated product",
                      "example": "Ajjas Lite"
                    },
                    "productImage": {
                      "type": "string",
                      "description": "Image path/URL for the product",
                      "example": "uploads/products/ajjas-lite.png"
                    },
                    "benefits": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "description": "List of benefits included in the warranty",
                      "example": [
                        "Free Replacement",
                        "24/7 Support",
                        "Water Damage Protection"
                      ]
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Warranty plan created successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Warranty plan created successfully"
                      },
                      "data": {
                        "$ref": "#/components/schemas/WarrantyPlan"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - Missing required fields",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "planName, durationMonths, originalPrice and offerPrice are required"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Something went wrong"
                      },
                      "error": {
                        "type": "string",
                        "example": "Error details"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/warranty/device-warranty/{imei}": {
        "get": {
          "summary": "Retrieve active device warranty details and available offers",
          "description": "Fetches current active warranty coverage details (including days left and expiry date) and the latest available warranty extension offer for the specified vehicle IMEI.",
          "tags": [
            "Warranties"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "imei",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "The IMEI number of the tracker/device",
              "example": "123456789012345"
            }
          ],
          "responses": {
            "200": {
              "description": "Device warranty details and offers retrieved successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Device warranty fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "vehicle": {
                            "type": "object",
                            "properties": {
                              "_id": {
                                "type": "string",
                                "example": "651f82f80c6be812b1d3ef12"
                              },
                              "imei": {
                                "type": "string",
                                "example": "123456789012345"
                              },
                              "vehicleName": {
                                "type": "string",
                                "example": "Civic"
                              },
                              "vehicleNumber": {
                                "type": "string",
                                "example": "MH12AB1234"
                              },
                              "displayName": {
                                "type": "string",
                                "example": "Civic (MH12AB1234)"
                              }
                            }
                          },
                          "warranty": {
                            "type": "object",
                            "properties": {
                              "expiryDate": {
                                "type": "string",
                                "format": "date-time",
                                "example": "2027-05-19T06:17:34.000Z"
                              },
                              "expiryDateText": {
                                "type": "string",
                                "example": "19 May 2027"
                              },
                              "daysLeft": {
                                "type": "number",
                                "example": 365
                              },
                              "daysLeftText": {
                                "type": "string",
                                "example": "365 days left"
                              }
                            }
                          },
                          "offer": {
                            "type": "object",
                            "properties": {
                              "planId": {
                                "type": "string",
                                "example": "651f82f80c6be812b1d3ef15"
                              },
                              "planName": {
                                "type": "string",
                                "example": "1 Year Extended Warranty"
                              },
                              "durationMonths": {
                                "type": "number",
                                "example": 12
                              },
                              "title": {
                                "type": "string",
                                "example": "Extend warranty of your Ajjas Lite by 1 year @ ₹1/day"
                              },
                              "subtitle": {
                                "type": "string",
                                "example": "Secure your vehicle tracking uninterrupted"
                              },
                              "productName": {
                                "type": "string",
                                "example": "Ajjas Lite"
                              },
                              "productImage": {
                                "type": "string",
                                "example": "http://localhost:5000/uploads/products/ajjas-lite.png"
                              },
                              "originalPrice": {
                                "type": "number",
                                "example": 999
                              },
                              "offerPrice": {
                                "type": "number",
                                "example": 365
                              },
                              "buttonText": {
                                "type": "string",
                                "example": "Extend warranty now @ ₹365 ₹999"
                              },
                              "benefits": {
                                "type": "array",
                                "items": {
                                  "type": "string"
                                },
                                "example": [
                                  "Free Replacement",
                                  "24/7 Support"
                                ]
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - IMEI is required",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "IMEI is required"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Vehicle or active warranty plan not found",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Vehicle not found for this IMEI"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Something went wrong"
                      },
                      "error": {
                        "type": "string",
                        "example": "Error details"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/warranty/warranty-payment-summary/{imei}/{planId}": {
        "get": {
          "summary": "Retrieve warranty billing & payment summary details",
          "description": "Generates check-out and pricing breakdown details for extending a specific warranty plan for a device.",
          "tags": [
            "Warranties"
          ],
          "parameters": [
            {
              "in": "path",
              "name": "imei",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "Device IMEI number",
              "example": "123456789012345"
            },
            {
              "in": "path",
              "name": "planId",
              "required": true,
              "schema": {
                "type": "string"
              },
              "description": "The MongoDB ObjectId of the WarrantyPlan",
              "example": "651f82f80c6be812b1d3ef15"
            }
          ],
          "responses": {
            "200": {
              "description": "Payment checkout summary generated successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Warranty payment summary fetched successfully"
                      },
                      "data": {
                        "type": "object",
                        "properties": {
                          "selectedPlan": {
                            "type": "object",
                            "properties": {
                              "planId": {
                                "type": "string",
                                "example": "651f82f80c6be812b1d3ef15"
                              },
                              "planName": {
                                "type": "string",
                                "example": "1 Year Extended Warranty"
                              },
                              "durationMonths": {
                                "type": "number",
                                "example": 12
                              },
                              "productName": {
                                "type": "string",
                                "example": "Ajjas Lite"
                              },
                              "vehicleName": {
                                "type": "string",
                                "example": "Civic"
                              },
                              "vehicleNumber": {
                                "type": "string",
                                "example": "MH12AB1234"
                              },
                              "displayName": {
                                "type": "string",
                                "example": "Civic(MH12AB1234)"
                              },
                              "originalPrice": {
                                "type": "number",
                                "example": 999
                              },
                              "offerPrice": {
                                "type": "number",
                                "example": 365
                              }
                            }
                          },
                          "paymentSummary": {
                            "type": "object",
                            "properties": {
                              "vehicleText": {
                                "type": "string",
                                "example": "Civic (MH12AB1234)"
                              },
                              "productName": {
                                "type": "string",
                                "example": "Ajjas Lite"
                              },
                              "originalPrice": {
                                "type": "number",
                                "example": 999
                              },
                              "discountText": {
                                "type": "string",
                                "example": "Booster offer @50% OFF"
                              },
                              "discountAmount": {
                                "type": "number",
                                "example": 634
                              },
                              "payableAmount": {
                                "type": "number",
                                "example": 365
                              }
                            }
                          },
                          "buttonText": {
                            "type": "string",
                            "example": "Amount Payable ₹365"
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - IMEI and planId are required",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "IMEI and planId are required"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Vehicle or warranty plan not found",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Vehicle not found for this IMEI"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Something went wrong"
                      },
                      "error": {
                        "type": "string",
                        "example": "Error details"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/warranty/extend-warranty": {
        "post": {
          "summary": "Extend device warranty with plan purchase",
          "description": "Creates an active vehicle warranty extension entry. Deactivates existing active warranties for the vehicle.",
          "tags": [
            "Warranties"
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "imei",
                    "planId"
                  ],
                  "properties": {
                    "imei": {
                      "type": "string",
                      "description": "Device IMEI number",
                      "example": "123456789012345"
                    },
                    "planId": {
                      "type": "string",
                      "description": "The MongoDB ObjectId of the WarrantyPlan",
                      "example": "651f82f80c6be812b1d3ef15"
                    },
                    "paymentStatus": {
                      "type": "string",
                      "enum": [
                        "pending",
                        "paid",
                        "failed"
                      ],
                      "description": "Payment resolution status",
                      "example": "paid"
                    },
                    "transactionId": {
                      "type": "string",
                      "description": "Online payment gate transaction identifier",
                      "example": "txn_9876543210"
                    },
                    "paymentMethod": {
                      "type": "string",
                      "description": "Selected payment gateway/method",
                      "example": "Razorpay"
                    },
                    "amountPaid": {
                      "type": "number",
                      "description": "Total amount charged (defaults to offerPrice if omitted)",
                      "example": 365
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Warranty extended successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": true
                      },
                      "message": {
                        "type": "string",
                        "example": "Warranty extended successfully"
                      },
                      "data": {
                        "$ref": "#/components/schemas/VehicleWarrantyResponse"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - IMEI and planId are required",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "IMEI and planId are required"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Vehicle or warranty plan not found",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Vehicle not found for this IMEI"
                      }
                    }
                  }
                }
              }
            },
            "500": {
              "description": "Internal server error",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean",
                        "example": false
                      },
                      "message": {
                        "type": "string",
                        "example": "Something went wrong"
                      },
                      "error": {
                        "type": "string",
                        "example": "Error details"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "tags": [
      {
        "name": "AppUpdate",
        "description": "API for managing application updates (versioning, release dates, release notes)"
      },
      {
        "name": "Auth",
        "description": "User authentication and OTP management"
      },
      {
        "name": "DataPlans",
        "description": "API for managing recharge/data plans and vehicle subscriptions"
      },
      {
        "name": "Device Assignment",
        "description": "Managing device (IMEI) assignment to users and vehicles"
      },
      {
        "name": "Device",
        "description": "Device and GPS tracking data"
      },
      {
        "name": "Documents",
        "description": "API for managing vehicle and personal documents"
      },
      {
        "name": "Features",
        "description": "API for managing discoverable application features, categories, and intro walk-throughs"
      },
      {
        "name": "GeoFence",
        "description": "Geofence management"
      },
      {
        "name": "Health Insurance",
        "description": "API for managing health insurance providers and user health insurance details"
      },
      {
        "name": "Help & Support",
        "description": "API endpoints for managing slot booking, issues, suggestions, and customer support."
      },
      {
        "name": "Journey",
        "description": "Journey and ride history management"
      },
      {
        "name": "Logo",
        "description": "Managing branding logos for the tracker"
      },
      {
        "name": "New Theme",
        "description": "New UI Theme management"
      },
      {
        "name": "Notification",
        "description": "User notification management"
      },
      {
        "name": "Overspeed Alerts",
        "description": "API for managing and checking overspeed alerts"
      },
      {
        "name": "Plus Membership",
        "description": "Plus membership plans and user subscription activation"
      },
      {
        "name": "PromoVideo",
        "description": "Promotional video management"
      },
      {
        "name": "Service Logs",
        "description": "Service log management API"
      },
      {
        "name": "Statistics",
        "description": "Vehicle performance and telemetry statistics"
      },
      {
        "name": "Theme",
        "description": "UI Theme management"
      },
      {
        "name": "User",
        "description": "User management and retrieval"
      },
      {
        "name": "VehicleControl",
        "description": "API for managing vehicle controls (tank capacity, mileage, locking/unlocking, and vehicle images)"
      },
      {
        "name": "VehicleRefuel",
        "description": "API for managing vehicle refueling data, fuel consumption logs, and refuel history."
      },
      {
        "name": "Vehicle",
        "description": "Vehicle management"
      },
      {
        "name": "VideoTutorial",
        "description": "Video tutorial management"
      },
      {
        "name": "VideoTutorialCategory",
        "description": "Video tutorial category management"
      },
      {
        "name": "Warranties",
        "description": "API for managing device warranty plans and extensions"
      }
    ]
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  var urls = options.swaggerUrls
  var customOptions = options.customOptions
  var spec1 = options.swaggerDoc
  var swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (var attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  var ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.oauth) {
    ui.initOAuth(customOptions.oauth)
  }

  if (customOptions.preauthorizeApiKey) {
    const key = customOptions.preauthorizeApiKey.authDefinitionKey;
    const value = customOptions.preauthorizeApiKey.apiKeyValue;
    if (!!key && !!value) {
      const pid = setInterval(() => {
        const authorized = ui.preauthorizeApiKey(key, value);
        if(!!authorized) clearInterval(pid);
      }, 500)

    }
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }

  window.ui = ui
}
