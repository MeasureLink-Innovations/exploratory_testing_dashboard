import requests
import sys
import os

BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:3000/api')

def upload_artifacts(session_id, file_paths, artifact_type=None):
    """
    Upload one or more files to an active session.
    """
    url = f'{BASE_URL}/artifacts'
    
    files_payload = []
    for fp in file_paths:
        if os.path.exists(fp):
            files_payload.append(('files', open(fp, 'rb')))
        else:
            print(f"Warning: File not found: {fp}")

    if not files_payload:
        return []

    data = {
        'session_id': session_id,
    }
    if artifact_type:
        data['type'] = artifact_type

    try:
        print(f"Uploading {len(files_payload)} file(s) to session {session_id}...")
        response = requests.post(url, files=files_payload, data=data)
        
        # Close all file handles
        for _, f in files_payload:
            f.close()

        if response.status_code == 201:
            artifacts = response.json()
            print(f"Successfully uploaded {len(artifacts)} artifacts.")
            return artifacts
        else:
            print(f"Failed to upload: {response.status_code} - {response.text}")
            return []
    except Exception as e:
        print(f"Error during upload: {e}")
        return []

def push_log(session_id, content, category='note', author='machine', artifact_ids=None):
    """
    Push a log entry (note, finding, or issue) to the session timeline.
    """
    url = f'{BASE_URL}/logs'
    
    payload = {
        'session_id': session_id,
        'content': content,
        'category': category,
        'author': author,
        'artifact_ids': artifact_ids or []
    }

    try:
        print(f"Pushing {category} log to session {session_id}...")
        response = requests.post(url, json=payload)
        
        if response.status_code == 201:
            log = response.json()
            print(f"Successfully pushed log (ID: {log['id']}).")
            return log
        else:
            print(f"Failed to push log: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Error during log push: {e}")
        return None

def main():
    if len(sys.argv) < 3:
        print("Machine Integration Example Usage:")
        print("  python test_push.py <session_id> <file_path_1> [file_path_2] ...")
        sys.exit(1)
        
    sid = sys.argv[1]
    file_paths = sys.argv[2:]
    
    # 1. Upload Artifacts first
    artifacts = upload_artifacts(sid, file_paths)
    
    # 2. If upload was successful, push an automated finding log that links to them
    if artifacts:
        artifact_ids = [a['id'] for a in artifacts]
        artifact_names = ", ".join([a['name'] for a in artifacts])
        
        push_log(
            session_id=sid,
            content=f"Machine auto-captured evidence: {artifact_names}",
            category="finding",
            author="machine",
            artifact_ids=artifact_ids
        )
    else:
        # Just push a note if no files were provided or upload failed
        push_log(
            session_id=sid,
            content="Machine heartbeat: No artifacts captured in this cycle.",
            category="note",
            author="machine"
        )

if __name__ == "__main__":
    main()
