import { NextResponse } from 'next/server';

export async function GET() {
  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;

  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    env_vars: {
      TWILIO_ACCOUNT_SID: TWILIO_ACCOUNT_SID ? `${TWILIO_ACCOUNT_SID.substring(0, 6)}...${TWILIO_ACCOUNT_SID.substring(TWILIO_ACCOUNT_SID.length - 4)}` : 'NOT SET',
      TWILIO_AUTH_TOKEN: TWILIO_AUTH_TOKEN ? `SET (${TWILIO_AUTH_TOKEN.length} chars)` : 'NOT SET',
      TWILIO_WHATSAPP_NUMBER: TWILIO_WHATSAPP_NUMBER || 'NOT SET',
    },
    tests: {}
  };

  // Test Twilio API
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}.json`,
        {
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        diagnostics.tests.twilio_auth = {
          status: 'OK',
          account_name: data.friendly_name,
          account_status: data.status,
        };
      } else {
        const errorText = await response.text();
        diagnostics.tests.twilio_auth = {
          status: 'FAILED',
          http_status: response.status,
          error: errorText,
        };
      }
    } catch (error) {
      diagnostics.tests.twilio_auth = {
        status: 'ERROR',
        message: String(error),
      };
    }
  } else {
    diagnostics.tests.twilio_auth = {
      status: 'SKIPPED',
      reason: 'Missing credentials',
    };
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
