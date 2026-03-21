import requests
import sys

def upload_artifact(session_id, file_path, artifact_type):
    url = 'http://localhost:3000/api/artifacts'
    
    try:
        with open(file_path, 'rb') as f:
            files = {'file': f}
            data = {
                'session_id': session_id,
                'type': artifact_type,
                'metadata': '{"machine": "test-box-01", "os": "linux"}'
            }
            
            print(f"Uploading {file_path} to session {session_id}...")
            response = requests.post(url, files=files, data=data)
            
            if response.status_code == 201:
                print("Success!")
                print(response.json())
            else:
                print(f"Failed with status code {response.status_code}")
                print(response.text)
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python test_push.py <session_id> <file_path> [type]")
        sys.exit(1)
        
    sid = sys.argv[1]
    fp = sys.argv[2]
    tp = sys.argv[3] if len(sys.argv) > 3 else 'log'
    
    upload_artifact(sid, fp, tp)
