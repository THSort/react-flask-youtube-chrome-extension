from flask import Flask, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi

app = Flask(__name__)

@app.route('/get_transcript', methods=['POST'])
def get_transcript():
    try:
        # Get the YouTube video ID from the request
        video_id = request.json.get('video_id')

        # Check if the video_id is provided
        if not video_id:
            return jsonify({'error': 'Video ID is required'}), 400

        # Get the transcript
        transcript = YouTubeTranscriptApi.get_transcript(video_id, ['en', 'en-GB'])

        # creating or overwriting a file "subtitles.txt" with
        # the info inside the context manager
        
        mystr = ''
        with open("subtitles.txt", "w") as f:
            # iterating through each element of list srt
            for i in transcript:
                # writing each element of srt on a new line
                f.write("{}\n".format(i))
                mystr = mystr + str(i) + '\n'

        # Return the transcript as JSON
        return jsonify({'transcript': mystr})

    except Exception as e:
        print('error:', e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
