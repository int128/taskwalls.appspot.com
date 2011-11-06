#!/usr/bin/perl -w

while(<>) {
	if (/#(\w)(\w)(\w)/) {
		$r=to_background_factor($1);
		$g=to_background_factor($2);
		$b=to_background_factor($3);
		$i=$.-1;
		print <<EOB
.tasklistcolor-$i { background: -webkit-gradient(linear, left top, left bottom, from(#fff), to(#$r$g$b) ); }
.tasklistcolor-$i { background: -moz-linear-gradient(top, #fff, #$r$g$b); }
EOB
	}
}
sub to_background_factor {
	return sprintf('%02x', hex($_[0]) + 240);
}
