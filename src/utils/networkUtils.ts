import { NextRequest } from 'next/server';


export function getIP(request : NextRequest) {
  const FALLBACK_IP_ADDRESS = '0.0.0.0'
  const forwardedFor = request.headers.get('x-forwarded-for')
 
  if (forwardedFor) {
    return forwardedFor.split(',')[0] ?? FALLBACK_IP_ADDRESS
  }
 
  return request.headers.get('x-real-ip') ?? FALLBACK_IP_ADDRESS
}