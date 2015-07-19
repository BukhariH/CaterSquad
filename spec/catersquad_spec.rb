require_relative "spec_helper"
require_relative "../catersquad.rb"

def app
  Catersquad
end

describe Catersquad do
  it "responds with a welcome message" do
    get '/'

    last_response.body.must_include 'Welcome to the Sinatra Template!'
  end
end
