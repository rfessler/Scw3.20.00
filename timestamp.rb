# SearsGarageWeb Project's timestamp.rb
# used to timestamp sass files

module Sass::Script::Functions
    def timestamp()
        return Sass::Script::String.new(Time.now.to_s)
    end
end

# => Add the following to the config.rb file:
# => 	  	require File.join(File.dirname(__FILE__), 'timestamp.rb')


#USAGE:
# => 		/*!
# => 	 	* CSS Compiled on: #{timestamp()}
# => 	 	*/
# 



#REF:
# => 		http://stackoverflow.com/questions/13022461/add-timestamps-to-compiled-sass-scss?rq=1




