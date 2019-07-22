clc
clear

files = dir('*_white.svg');

for i=1:length(files)
    disp(['<img src="' strrep(files(i).name,'_white','') '" width="100" height="100"/><img src="' files(i).name '" width="100" height="100"/>'])
end