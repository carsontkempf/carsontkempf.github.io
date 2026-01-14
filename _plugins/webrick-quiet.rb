# Suppress WEBrick connection reset error messages
require 'webrick'

# Override WEBrick's logger to filter connection reset messages
class WEBrick::Log < WEBrick::BasicLog
  def error(msg)
    # Suppress connection reset peer errors - they're harmless
    return if msg.to_s =~ /Errno::ECONNRESET|Connection reset by peer/i
    super(msg)
  end
end
