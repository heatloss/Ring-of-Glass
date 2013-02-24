Conversations = {
  "threads": {
    "intro": {
       "nodes": [
        {
          "type": "text",
          "display": "thinking",
          "speaker": "declan",
          "text": "Can't... see."
        },
        {
          "type": "text",
          "display": "thinking",
          "speaker": "declan",
          "text": "What the hell?"
        },
        {
          "type": "text",
          "display": "thinking",
          "speaker": "declan",
          "text": "Okay, this is bad."
        },
        {
          "type": "text",
          "display": "thinking",
          "speaker": "declan",
          "text": "Maybe I'm just..."
        },
        {
          "id": "whycantisee",
          "type": "decision",
          "nodes": [
            {
              "ref": "amiblind",
              "text": "Have I gone blind, or something?"
            },
            {
              "ref": "isitdark",
              "text": "Maybe it's just really dark in here."
            },
            {
              "ref": "aremyimplantsdead",
              "reqread": "amiblind, isitdark",
              "reqtype": "or",
              "text": "Maybe my eye implants are malfunctioning?"
            }

          ]
        }
      ]
    },

    "talktoguard": {
      "type": "root",
      "listener": "none",
      "nodes": [
        {
          "type": "switch",
          "switch": "playthrough",
          "nodes": [
            {
              "type": "condition",
              "condition": [ "1" ],
              "nodes": [
                {
                  "type": "text",
                  "speaker": "declan",
                  "text": "Hey."
                },
                {
                  "type": "text",
                  "speaker": "declan",
                  "text": "..."
                },
                {
                  "type": "text",
                  "speaker": "declan",
                  "listener": "frank",
                  "text": "Hey!"
                },
                {
                  "type": "text",
                  "speaker": "declan",
                  "text": "I'm pretty sure I have the right to a phone call."
                },
                {
                  "type": "text",
                  "speaker": "frank",
                  "listener": "none",
                  "pose": "shouting",
                  "text": "Shut up and sit still. You'll get your call when I'm done here."
                },
                {
                  "type": "switch",
                  "switch": "unread",
                  "nodes": [
                    {
                      "type": "condition",
                      "condition": [ "lookatphone" ],
                      "nodes": [
                        {
                          "type": "text",
                          "speaker": "declan",
                          "display": "thinking",
                          "text": "Typical. Screw this guy."
                        }
                      ]
                    },
                    {
                      "type": "condition",
                      "condition": "otherwise",
                      "nodes": [
                        {
                          "type": "text",
                          "speaker": "declan",
                          "display": "thinking",
                          "pose": "analyzing",
                          "text": "Dammit. I need to get at that phone."
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "type": "condition",
              "condition": "otherwise",
              "nodes": [
                {
                  "type": "switch",
                  "switch": "unread",
                  "nodes": [
                    {
                      "type": "condition",
                      "condition": [ "lookatphone", "lookatcomputer" ],
                      "nodes": [
                        {
                          "type": "text",
                          "speaker": "declan",
                          "text": "So, Uh..."
                        },
                        {
                          "type": "text",
                          "speaker": "declan",
                          "text": "...",
                          "ref": "exit"
                        }
                      ]
                    },
                    {
                      "type": "condition",
                      "condition": "otherwise",
                      "nodes": [
                        {
                          "type": "text",
                          "speaker": "declan",
                          "text": "All right, here goes nothing."
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  }
};