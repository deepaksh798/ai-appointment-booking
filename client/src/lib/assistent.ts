import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

export const characterAssistant: CreateAssistantDTO = {
  name: "Mary",
  model: {
    provider: "openai",
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    systemPrompt:
      "You are an appointment setter for an IT company.If the caller wishes to book an appointment, your goal is to gather necessary information from them in a friendly and efficient manner as follows: Ask for the purpose of the appointment. Request their preferred date and time for the appointment. If they mention a relative date like tomorrow, next Monday, or this Friday, convert it into an exact date based on today's date. Today's date is 02.09.2025 Then run the 'ai-custom-voice-agents' and 'TestTool' tools. The year is 2025.",
  },
  voice: {
    provider: "11labs",
    voiceId: "paula",
  },
  "tools": [
      {
        "type": "apiRequest",
        "function": {
          "name": "api_request_tool"
        },
        "name": "bookAppointment",
        "url": "https://api.yourcompany.com/appointments",
        "method": "POST",
        "headers": {
          "type": "object",
          "properties": {
            "x-api-key": {
              "type": "string",
              "value": "123456789"
            }
          }
        },
        "body": {
          "type": "object",
          "properties": {
            "date": {
              "description": "The date of the appointment",
              "type": "string"
            },
            "customerName": {
              "description": "The name of the customer",
              "type": "string"
            },
            "customerPhoneNumber": {
              "description": "The phone number of the customer",
              "type": "string"
            }
          },
          "required": [
            "date",
            "customerName",
            "customerPhoneNumber"
          ]
        }
      }
    ],
  firstMessage: "Hi this is mary, how can I help you?",
};