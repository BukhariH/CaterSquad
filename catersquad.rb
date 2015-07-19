require 'json'
require 'sequel'

class Catersquad < Sinatra::Base
	
	# DB = Sequel.sqlite

  set :public_folder => "public", :static => true

  get "/" do
    erb :manager
  end

  post "/" do
  	content_type :json
  	params.to_json
  end

  get "/participant" do
    erb :participant
  end

  get "/restaurant" do
    erb :restaurant
  end

end
