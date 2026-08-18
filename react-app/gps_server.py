import socket
import binascii
import json

HOST = '0.0.0.0'
PORT = 4000

# CRC-ITU lookup table
crctab16 = [
    0X0000, 0X1189, 0X2312, 0X329B, 0X4624, 0X57AD, 0X6536, 0X74BF, 
    0X8C48, 0X9DC1, 0XAF5A, 0XBED3, 0XCA6C, 0XDBE5, 0XE97E, 0XF8F7, 
    0X1081, 0X0108, 0X3393, 0X221A, 0X56A5, 0X472C, 0X75B7, 0X643E, 
    0X9CC9, 0X8D40, 0XBFDB, 0XAE52, 0XDAED, 0XCB64, 0XF9FF, 0XE876, 
    0X2102, 0X308B, 0X0210, 0X1399, 0X6726, 0X76AF, 0X4434, 0X55BD, 
    0XAD4A, 0XBCC3, 0X8E58, 0X9FD1, 0XEB6E, 0XFAE7, 0XC87C, 0XD9F5, 
    0X3183, 0X200A, 0X1291, 0X0318, 0X77A7, 0X662E, 0X54B5, 0X453C, 
    0XBDCB, 0XAC42, 0X9ED9, 0X8F50, 0XFBEF, 0XEA66, 0XD8FD, 0XC974, 
    0X4204, 0X538D, 0X6116, 0X709F, 0X0420, 0X15A9, 0X2732, 0X36BB, 
    0XCE4C, 0XDFC5, 0XED5E, 0XFCD7, 0X8868, 0X99E1, 0XAB7A, 0XBAF3, 
    0X5285, 0X430C, 0X7197, 0X601E, 0X14A1, 0X0528, 0X37B3, 0X263A, 
    0XDECD, 0XCF44, 0XFDDF, 0XEC56, 0X98E9, 0X8960, 0XBBFB, 0XAA72, 
    0X6306, 0X728F, 0X4014, 0X519D, 0X2522, 0X34AB, 0X0630, 0X17B9, 
    0XEF4E, 0XFEC7, 0XCC5C, 0XDDD5, 0XA96A, 0XB8E3, 0X8A78, 0X9BF1, 
    0X7387, 0X620E, 0X5095, 0X411C, 0X35A3, 0X242A, 0X16B1, 0X0738, 
    0XFFCF, 0XEE46, 0XDCDD, 0XCD54, 0XB9EB, 0XA862, 0X9AF9, 0X8B70, 
    0X8408, 0X9581, 0XA71A, 0XB693, 0XC22C, 0XD3A5, 0XE13E, 0XF0B7, 
    0X0840, 0X19C9, 0X2B52, 0X3ADB, 0X4E64, 0X5FED, 0X6D76, 0X7CFF, 
    0X9489, 0X8500, 0XB79B, 0XA612, 0XD2AD, 0XC324, 0XF1BF, 0XE036, 
    0X18C1, 0X0948, 0X3BD3, 0X2A5A, 0X5EE5, 0X4F6C, 0X7DF7, 0X6C7E, 
    0XA50A, 0XB483, 0X8618, 0X9791, 0XE32E, 0XF2A7, 0XC03C, 0XD1B5, 
    0X2942, 0X38CB, 0X0A50, 0X1BD9, 0X6F66, 0X7EEF, 0X4C74, 0X5DFD, 
    0XB58B, 0XA402, 0X9699, 0X8710, 0XF3AF, 0XE226, 0XD0BD, 0XC134, 
    0X39C3, 0X284A, 0X1AD1, 0X0B58, 0X7FE7, 0X6E6E, 0X5CF5, 0X4D7C, 
    0XC60C, 0XD785, 0XE51E, 0XF497, 0X8028, 0X91A1, 0XA33A, 0XB2B3, 
    0X4A44, 0X5BCD, 0X6956, 0X78DF, 0X0C60, 0X1DE9, 0X2F72, 0X3EFB, 
    0XD68D, 0XC704, 0XF59F, 0XE416, 0X90A9, 0X8120, 0XB3BB, 0XA232, 
    0X5AC5, 0X4B4C, 0X79D7, 0X685E, 0X1CE1, 0X0D68, 0X3FF3, 0X2E7A, 
    0XE70E, 0XF687, 0XC41C, 0XD595, 0XA12A, 0XB0A3, 0X8238, 0X93B1, 
    0X6B46, 0X7ACF, 0X4854, 0X59DD, 0X2D62, 0X3CEB, 0X0E70, 0X1FF9, 
    0XF78F, 0XE606, 0XD49D, 0XC514, 0XB1AB, 0XA022, 0X92B9, 0X8330, 
    0X7BC7, 0X6A4E, 0X58D5, 0X495C, 0X3DE3, 0X2C6A, 0X1EF1, 0X0F78
]

def get_crc16(pData):
    fcs = 0xffff
    for byte in pData:
        fcs = (fcs >> 8) ^ crctab16[(fcs ^ byte) & 0xff]
    return ~fcs & 0xffff

def create_response(protocol_num, serial_bytes):
    # Length of protocol + serial + crc = 1 + 2 + 2 = 5 bytes
    length = 0x05
    payload = bytes([length, protocol_num]) + serial_bytes
    crc = get_crc16(payload)
    
    response = bytes([0x78, 0x78]) + payload + crc.to_bytes(2, byteorder='big') + bytes([0x0D, 0x0A])
    return response

def handle_client(conn, addr):
    print(f"\n[+] GPS Device Connected: {addr}")
    conn.settimeout(60) # 60 seconds timeout
    
    while True:
        try:
            data = conn.recv(1024)
            if not data:
                print(f"[-] Device disconnected: {addr}")
                break
                
            # 1. Handle JSON Payloads
            if data.startswith(b'{'):
                try:
                    json_str = data.decode('utf-8')
                    parsed_data = json.loads(json_str)
                    
                    # Check for 'avls' format
                    if 'avls' in parsed_data:
                        for entry in parsed_data['avls']:
                            imei = entry.get('imei')
                            if imei == '860710085971854':
                                lat = entry.get('lat')
                                lng = entry.get('lng')
                                status = entry.get('gpsStt')
                                print(f"\n[!!!] TARGET IMEI MATCH: {imei} [!!!]")
                                print(f"      Location: Lat={lat}, Lng={lng}, Status={status}")
                                if status == 'V':
                                    print("      (Note: Status 'V' means Void/No GPS fix yet)")
                                
                    # Check for 'gd' format
                    elif 'gd' in parsed_data:
                        for entry in parsed_data['gd']:
                            imei = entry.get('imei')
                            if imei == '860710085971854':
                                lat = entry.get('lt')
                                lng = entry.get('lg')
                                print(f"\n[!!!] TARGET IMEI MATCH: {imei} [!!!]")
                                print(f"      Location: Lat={lat}, Lng={lng}")
                                
                    print(f"[{addr}] Parsed JSON: {json_str.strip()}")
                except Exception as e:
                    print(f"[{addr}] JSON Parse Error: {e}")
                continue # Skip hex parsing if it's JSON

            # 2. Handle Binary (Hex) Payloads
            hex_str = ' '.join(f'{b:02X}' for b in data)
            print(f"[{addr}] Received: {hex_str}")
            
            # Simple packet parser (Supports 0x78 0x78 and 0x79 0x79)
            if len(data) >= 10 and (data[0] in [0x78, 0x79]) and (data[1] in [0x78, 0x79]):
                packet_length = data[2]
                protocol = data[3]
                
                if protocol == 0x01:
                    print(f"[{addr}] Parsed: LOGIN Message")
                    # Terminal ID is 8 bytes (data[4:12])
                    imei_hex = data[4:12].hex()
                    print(f"[{addr}] Device ID (IMEI): {imei_hex}")
                    
                    serial = data[12:14] # Information Serial Number
                    
                    # Send response to login so tracker knows connection is successful
                    response = create_response(0x01, serial)
                    print(f"[{addr}] Sending Login Response: {' '.join(f'{b:02X}' for b in response)}")
                    conn.sendall(response)
                    
                elif protocol == 0x12:
                    print(f"[{addr}] Parsed: LOCATION Data")
                    # We can parse the location data here based on the manual (Section 5.2.1.4)
                    
                elif protocol == 0x13:
                    print(f"[{addr}] Parsed: STATUS/HEARTBEAT Message")
                    serial = data[-6:-4] # Information Serial Number is before CRC and Stop Bits
                    
                    # Send heartbeat response
                    response = create_response(0x13, serial)
                    print(f"[{addr}] Sending Heartbeat Response: {' '.join(f'{b:02X}' for b in response)}")
                    conn.sendall(response)
                elif protocol == 0x16:
                    print(f"[{addr}] Parsed: ALARM Data")
                else:
                    print(f"[{addr}] Parsed: Other Protocol (0x{protocol:02X})")
            
        except socket.timeout:
            print(f"[-] Connection timed out: {addr}")
            break
        except Exception as e:
            print(f"[-] Error handling data: {e}")
            break

def start_server():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind((HOST, PORT))
        s.listen()
        print(f"[*] Base GPS Server started. Listening on port {PORT}...")
        
        while True:
            try:
                conn, addr = s.accept()
                handle_client(conn, addr)
            except KeyboardInterrupt:
                print("\nServer stopped.")
                break
            except Exception as e:
                print(f"Error: {e}")

if __name__ == "__main__":
    start_server()
